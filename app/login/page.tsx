import LoginForm from "./LoginForm";

export default async function PaginaLogin({
  searchParams,
}: {
  searchParams: Promise<{ proximo?: string }>;
}) {
  const { proximo } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-neutral-50 px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-neutral-900">Garagem do Jota</h1>
        <p className="mb-6 text-sm text-neutral-500">Introduz a palavra-passe para entrar.</p>
        <LoginForm proximo={proximo ?? "/pedidos"} />
      </div>
    </main>
  );
}
