// Service Worker da Garagem do Jota — só para notificações push.
// De propósito não trata de caching de páginas: a app é sempre gerada
// em cada pedido (ver "dynamic = force-dynamic" em app/layout.tsx) e
// não queremos mudar esse comportamento "sempre atualizado".

self.addEventListener("push", (event) => {
  let dados = {};
  try {
    dados = event.data ? event.data.json() : {};
  } catch {
    dados = {};
  }

  const titulo = dados.titulo || "Garagem do Jota";
  const opcoes = {
    body: dados.corpo || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: dados.url || "/marcacoes" },
  };

  event.waitUntil(self.registration.showNotification(titulo, opcoes));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/marcacoes";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((lista) => {
      for (const cliente of lista) {
        if (cliente.url.includes(url) && "focus" in cliente) return cliente.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
