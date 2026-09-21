import RAPIER from "@dimforge/rapier2d-compat";

/**
 * Núcleo do easter egg: dá física de corpo rígido a **tudo que está na tela**
 * no momento da ativação.
 *
 * Os blocos são descobertos percorrendo o DOM em vez de marcados à mão: desce
 * enquanto o elemento for alto demais para ser um bloco e para no primeiro que
 * cabe. Isso encontra sozinho o título, o parágrafo, cada card — e continua
 * funcionando quando a página ganhar seção nova, sem ninguém lembrar de marcar.
 * `data-no-physics` exclui o que não deve cair.
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

/**
 * Empurrãozinho inicial. Sem isto os blocos só escorregam para baixo e
 * empilham alinhados — parece uma barra descendo, não a página desabando.
 * Um giro e um desvio lateral pequenos, diferentes por bloco, fazem eles
 * tombarem uns sobre os outros.
 */
const SPIN = 2.6; // rad/s
const NUDGE = 90; // px/s
const RESTORE_MS = 450;

/** Teto de corpos, para uma página gigante não virar uma simulação enorme. */
const MAX_BODIES = 140;
/** Acima desta fração da altura da tela, o elemento é contêiner, não bloco. */
const BLOCK_MAX_HEIGHT = 0.5;
/** Abaixo disto não vale a pena: espaçadores, divisores, ícones soltos. */
const MIN_SIZE = 24;

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

/**
 * Acha os blocos visíveis da página.
 *
 * Desce a árvore enquanto o elemento for alto demais para ser um bloco e para
 * no primeiro que cabe — assim uma <section> vira seus títulos, parágrafos e
 * cards, e não um retângulo gigante só. Quem é pego não é visitado por dentro,
 * então nenhum corpo fica dentro de outro (transforms se multiplicariam).
 */
const collectBlocks = (width: number, height: number): HTMLElement[] => {
  const blocks: HTMLElement[] = [];
  const maxHeight = height * BLOCK_MAX_HEIGHT;

  const visit = (element: Element): void => {
    if (blocks.length >= MAX_BODIES) return;
    if (!(element instanceof HTMLElement)) return;
    if (element.hasAttribute("data-no-physics")) return;

    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") return;
    // fixos são a moldura da experiência (canvas, botão de sair): não caem
    if (style.position === "fixed") return;

    const rect = element.getBoundingClientRect();
    const onScreen =
      rect.bottom > 0 &&
      rect.top < height &&
      rect.right > 0 &&
      rect.left < width;
    if (!onScreen) return;

    if (rect.height <= maxHeight && rect.width >= MIN_SIZE && rect.height >= MIN_SIZE) {
      blocks.push(element);
      return;
    }

    for (const child of element.children) visit(child);
  };

  visit(document.body);
  return blocks;
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

  const candidates = collectBlocks(width, height);

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

    // determinístico por posição: o mesmo bloco tomba igual toda vez, mas
    // blocos diferentes tombam diferente
    const seed = Math.sin(originX * 12.9898 + originY * 78.233) * 43758.5453;
    const random = seed - Math.floor(seed);

    const body = world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(originX / SCALE, originY / SCALE)
        .setLinvel(((random - 0.5) * NUDGE) / SCALE, 0)
        .setAngvel((random - 0.5) * SPIN)
        .setLinearDamping(0.05)
        .setAngularDamping(0.15)
    );
    world.createCollider(
      RAPIER.ColliderDesc.cuboid(
        rect.width / 2 / SCALE,
        rect.height / 2 / SCALE
      )
        // pouco quique e bastante atrito: a página desaba e assenta, em vez
        // de ficar pulando como bola
        .setRestitution(0.12)
        .setFriction(0.85)
        .setDensity(1),
      body
    );

    element.style.willChange = "transform";
    // O bloco vira objeto, não interface: sem isto dava para clicar num link
    // do rodapé e navegar com a página toda caída. O arrasto não depende
    // disso — ele é resolvido por hit-test na window, não por evento no nó.
    element.style.pointerEvents = "none";
    element.style.userSelect = "none";
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

  /**
   * `pointer-events` é herdado: um elemento `data-no-physics` dentro de um
   * bloco que caiu herda o `none` do pai e para de responder, mesmo sendo
   * `fixed`. Era o que deixava o botão de sair sem clique — e sem saída.
   */
  const interactive = [
    ...document.querySelectorAll<HTMLElement>("[data-no-physics]"),
  ];
  for (const element of interactive) {
    element.style.pointerEvents = "auto";
  }

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
      item.element.style.removeProperty("pointer-events");
      item.element.style.removeProperty("user-select");
      if (item.element.getAttribute("style") === "") {
        item.element.removeAttribute("style");
      }
    }

    restoreScroll(scrollLock);
    world.free();
  };

  return { dispose };
};
