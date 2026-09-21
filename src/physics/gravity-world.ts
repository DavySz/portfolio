import RAPIER from "@dimforge/rapier2d-compat";

/**
 * Núcleo do easter egg: dá física de corpo rígido aos elementos marcados com
 * `data-physics` que estiverem na viewport no momento da ativação.
 *
 * Este arquivo é o único que importa o Rapier, e só é carregado por `import()`
 * na ativação — quem nunca liga o modo não baixa nada disso.
 *
 * Os elementos **não saem do fluxo**: tudo é `transform` relativo à posição
 * original, então sair do modo é remover os estilos inline e pronto.
 */

/** Pixels por metro do mundo físico. Aterrissa numa queda com cara de real. */
const SCALE = 60;
const GRAVITY = 9.81;
/** Velocidade mínima do gesto, em px/s, para valer como arremesso. */
const THROW_EPSILON = 40;
const RESTORE_MS = 450;

interface Item {
  element: HTMLElement;
  body: RAPIER.RigidBody;
  /** centro original em px da viewport, para o transform ser relativo */
  originX: number;
  originY: number;
  halfWidth: number;
  halfHeight: number;
}

interface ScrollLock {
  htmlOverflow: string;
  bodyOverflow: string;
  bodyTouchAction: string;
}

export interface GravityWorld {
  dispose(): Promise<void>;
}

const lockScroll = (): ScrollLock => {
  const lock: ScrollLock = {
    htmlOverflow: document.documentElement.style.overflow,
    bodyOverflow: document.body.style.overflow,
    bodyTouchAction: document.body.style.touchAction,
  };
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  document.body.style.touchAction = "none";
  return lock;
};

const restoreScroll = (lock: ScrollLock): void => {
  document.documentElement.style.overflow = lock.htmlOverflow;
  document.body.style.overflow = lock.bodyOverflow;
  document.body.style.touchAction = lock.bodyTouchAction;
};

export const startGravity = async (): Promise<GravityWorld | null> => {
  await RAPIER.init();

  const width = window.innerWidth;
  const height = window.innerHeight;

  // Só o que está na tela agora: o resto da página fica intacto.
  const candidates = [
    ...document.querySelectorAll<HTMLElement>("[data-physics]"),
  ].filter((element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      rect.bottom > 0 &&
      rect.top < height &&
      rect.right > 0 &&
      rect.left < width
    );
  });

  // Sem nada marcado na tela não há o que derrubar. Antes disto o modo
  // "ligava" mesmo assim: travava o scroll e mostrava o botão de sair, com a
  // página intacta — parecia quebrado, e era.
  if (candidates.length === 0) return null;

  const world = new RAPIER.World({ x: 0, y: GRAVITY });

  // paredes: chão, teto e laterais na borda da viewport
  const wall = (x: number, y: number, hx: number, hy: number) => {
    const body = world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed().setTranslation(x / SCALE, y / SCALE)
    );
    world.createCollider(
      RAPIER.ColliderDesc.cuboid(hx / SCALE, hy / SCALE),
      body
    );
  };
  const thickness = 200;
  wall(width / 2, height + thickness / 2, width / 2 + thickness, thickness / 2);
  wall(width / 2, -thickness / 2, width / 2 + thickness, thickness / 2);
  wall(-thickness / 2, height / 2, thickness / 2, height / 2 + thickness);
  wall(width + thickness / 2, height / 2, thickness / 2, height / 2 + thickness);

  const items: Item[] = candidates.map((element) => {
    const rect = element.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    const body = world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(originX / SCALE, originY / SCALE)
        .setLinearDamping(0.2)
        .setAngularDamping(0.4)
    );
    world.createCollider(
      RAPIER.ColliderDesc.cuboid(
        rect.width / 2 / SCALE,
        rect.height / 2 / SCALE
      )
        .setRestitution(0.3)
        .setFriction(0.9)
        .setDensity(1),
      body
    );

    element.style.willChange = "transform";
    // o elemento vira alvo de arrasto, não de seleção/scroll
    element.style.touchAction = "none";

    return {
      element,
      body,
      originX,
      originY,
      halfWidth: rect.width / 2,
      halfHeight: rect.height / 2,
    };
  });

  const scrollLock = lockScroll();

  // ------------------------------------------------------------- arrastar

  let dragged: Item | null = null;
  let pointerId: number | null = null;
  let grabX = 0;
  let grabY = 0;
  let lastX = 0;
  let lastY = 0;
  let lastTime = 0;
  let velocityX = 0;
  let velocityY = 0;

  const itemAt = (x: number, y: number): Item | null => {
    // de trás para a frente: o último desenhado ganha
    for (let index = items.length - 1; index >= 0; index -= 1) {
      const item = items[index];
      const rect = item.element.getBoundingClientRect();
      if (
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
      ) {
        return item;
      }
    }
    return null;
  };

  const onPointerDown = (event: PointerEvent) => {
    if (dragged) return;
    const item = itemAt(event.clientX, event.clientY);
    if (!item) return;

    dragged = item;
    pointerId = event.pointerId;

    const translation = item.body.translation();
    grabX = event.clientX - translation.x * SCALE;
    grabY = event.clientY - translation.y * SCALE;

    lastX = event.clientX;
    lastY = event.clientY;
    lastTime = event.timeStamp;
    velocityX = 0;
    velocityY = 0;

    item.body.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased, true);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!dragged || event.pointerId !== pointerId) return;

    const elapsed = (event.timeStamp - lastTime) / 1000;
    if (elapsed > 0) {
      velocityX = (event.clientX - lastX) / elapsed;
      velocityY = (event.clientY - lastY) / elapsed;
    }
    lastX = event.clientX;
    lastY = event.clientY;
    lastTime = event.timeStamp;

    dragged.body.setNextKinematicTranslation({
      x: (event.clientX - grabX) / SCALE,
      y: (event.clientY - grabY) / SCALE,
    });
  };

  const onPointerUp = (event: PointerEvent) => {
    if (!dragged || event.pointerId !== pointerId) return;

    const item = dragged;
    dragged = null;
    pointerId = null;

    item.body.setBodyType(RAPIER.RigidBodyType.Dynamic, true);

    const speed = Math.hypot(velocityX, velocityY);
    if (speed > THROW_EPSILON) {
      item.body.setLinvel({ x: velocityX / SCALE, y: velocityY / SCALE }, true);
    }
  };

  window.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);

  // ----------------------------------------------------------------- loop

  let frame = 0;

  const tick = () => {
    world.step();

    for (const item of items) {
      const translation = item.body.translation();
      const rotation = item.body.rotation();
      const dx = translation.x * SCALE - item.originX;
      const dy = translation.y * SCALE - item.originY;
      item.element.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) rotate(${rotation.toFixed(4)}rad)`;
    }

    frame = requestAnimationFrame(tick);
  };

  frame = requestAnimationFrame(tick);

  // -------------------------------------------------------------- desfazer

  const dispose = async (): Promise<void> => {
    cancelAnimationFrame(frame);
    window.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);

    // volta animando para a posição original…
    for (const item of items) {
      item.element.style.transition = `transform ${RESTORE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;
      item.element.style.transform = "translate(0px, 0px) rotate(0rad)";
    }

    await new Promise((resolve) => window.setTimeout(resolve, RESTORE_MS));

    // …e só então some com todo vestígio de estilo inline
    for (const item of items) {
      item.element.style.removeProperty("transition");
      item.element.style.removeProperty("transform");
      item.element.style.removeProperty("will-change");
      item.element.style.removeProperty("touch-action");
      if (item.element.getAttribute("style") === "") {
        item.element.removeAttribute("style");
      }
    }

    restoreScroll(scrollLock);
    world.free();
  };

  return { dispose };
};
