_How Backend for Frontend can change the way we build modern applications_

## 🎯 The pain we all know

If you are a frontend developer, you have probably lived through this:

You are building a mobile app and you need a product list. You call the API and it returns a 500 kB JSON with 47 fields per product — and you need three of them: name, price and image.

Meanwhile, your colleague on the web dashboard complains that the same API does not bring enough. He needs stock levels, sales history, profit margin…

And there is still the Smart TV team suffering, because the API returns everything at once and freezes an interface that needs data in small chunks.

The result? One API trying to serve everyone, and serving everyone badly.

It is that Swiss Army knife with 47 tools where none of them does the job you actually came for.

## 🎵 Where BFF came from: Phil Calcado and SoundCloud

This pain is not new. In 2015, Phil Calcado was facing exactly this problem at SoundCloud. They had multiple platforms — web, mobile, a public API for partners — and a single backend API trying to serve all of them.

The question was: how do you optimize each platform's experience without breaking the others?

The answer was revolutionary in how simple it was: build a dedicated backend for each kind of frontend. That is how Backend for Frontend (BFF) was born.

## 🏗️ What BFF looks like in practice

Backend for Frontend is an architectural pattern that creates specific, optimized APIs for each type of client or platform.

Instead of one generic API trying to serve every context, you get APIs cut to measure.

It is like having a specialized waiter for each kind of guest in a restaurant:

A wine expert for the sommeliers
Someone who knows the kids' menu for families
A specialist in business lunches
Each one knows exactly what their guest needs.

## ⚠️ Careful: one BFF per TYPE, not per device

The first mistake everyone makes is thinking:

"I'll build a BFF for iOS"
"Another for Android"
"Another for Chrome"
"Another for Firefox"
That is wrong. You will duplicate logic and create a maintenance nightmare.

Think in TYPES of experience instead:

bff-mobile.js → serves iOS + Android (similar constraints)
bff-web.js → serves desktop web (more data, more power)
bff-public.js → serves public APIs (filtered data, rate limiting)

## 🎯 What a BFF is responsible for

A BFF is not just a proxy. It has specific jobs:

Aggregation

It combines data from multiple microservices. Instead of the frontend making five calls, the BFF makes those five calls and returns everything together.

Transformation

It shapes data specifically for each platform. Mobile needs a summary? The BFF filters. Web needs more detail? The BFF enriches.

Caching

It improves performance by holding on to data that does not change often.

Security

It filters sensitive data by context. The public API never sees a tax ID; the internal back office can.

Analytics

Platform-specific logging, so you can understand usage patterns.

## 🔧 The design patterns that matter

Aggregator Pattern — the basics

async function getOrderSummary(orderId) {
const [order, customer, shipping] = await Promise.all([
orderService.getOrder(orderId),
customerService.getCustomer(customerId),
shippingService.getStatus(orderId),
]);

return {
orderId: order.id,
customerName: customer.name,
status: shipping.status,
// Only what mobile actually needs
};
}

**One call from the frontend = three calls orchestrated inside the BFF**

Adapter Pattern — the basics

// Web BFF - full data
async function getOrderDetails(orderId) {
const orderData = await getOrderSummary(orderId);
const additionalData = await Promise.all([
paymentService.getHistory(orderId),
inventoryService.getItems(orderId),
auditService.getLogs(orderId),
]);

return {
...orderData,
paymentHistory: additionalData[0],
items: additionalData[1],
auditLogs: additionalData[2],
// Full data for the web admin
};
}

\*Mobile gets 3 essential fields, web gets 15 fields with full history. Each one optimized for what it actually needs.\*\*

## 🎪 The perfect trio: BFF + micro frontends + microservices

A BFF on its own is already powerful, but combined with micro frontends and microservices, that is where it clicks.

Picture three layers working in harmony:

Micro frontends: autonomy and independent deploys
BFF: data aggregation and optimization
Microservices: specialization and scalability
It is an orchestra where every section has its specialty, but everyone plays the same piece.

What the trio gives you

Full team autonomy

A team owns its micro frontend, its BFF, and has minimal dependencies on other teams. It can evolve, test and deploy without waiting on anyone.

Optimized performance

Micro frontend: loads only the JavaScript it needs
BFF: aggregates exactly the data it needs
Microservices: respond fast because they are specialized
Maintainability that is real:

Each layer evolves independently
Bugs stay isolated
Updates without breaking changes cascading down
Contract-driven development:

The BFF defines clear contracts between frontend and backend
Frontend can be built in parallel against BFF mocks
Backend can evolve without touching the frontend as long as the contract holds
Contract tests keep the layers compatible
_No more "I can't ship because it'll break team X's system"._

## 👨‍💻 Why the frontend should lead the BFF

Here is the central question: why should WE, frontend developers, be leading this?

🎯 The technical case

Domain knowledge:

We know exactly what data we need
We understand each platform's constraints
We know how users actually behave
A fast feedback loop:

With frontend leading: problem → adjust the BFF → test right away
With the traditional backend path: report → analyze → prioritize → build → test → back to frontend
Optimizations that come naturally:

Bundle size: we feel it when the API sends data nobody asked for
Network requests: we understand where the bottlenecks are
User experience: we see the impact directly

💼 The business case

Time to market:

Fewer dependencies between teams
Less communication overhead
Independent deployments
Product quality:

APIs optimized for real UX
Fewer integration bugs
Better performance
Team scalability:

Frontend devs who work full stack
Fewer bottlenecks on backend teams
More technical autonomy

🤝 Collaboration, not competition

The split of responsibilities is natural:

Backend team:

Domain microservices
Core infrastructure
Data and persistence
Pure domain APIs
Frontend team:

A BFF per interface
Micro frontends
UX optimizations
Client-specific APIs

Final thought
"BFF is not about technology. It is about ownership and autonomy."

As frontend developers, we have everything we need to lead this change:

The technical knowledge
The business motivation
The ability to execute
What is missing is the nerve to take the first step.

Are we ready to build frontends that are faster, more maintainable and more autonomous?

_If you have implemented a BFF at your company, or you have questions about where to start, share it in the comments. Let's keep this conversation going._

Further reading:

Phil Calcado's original article
Case study: Netflix BFF Strategy
_Enjoyed this? Give it a clap 👏 and share it with your frontend team._
