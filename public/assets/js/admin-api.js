export async function adminApi(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      credentials: 'same-origin',
      cache: 'no-store',
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers }
    });
  } catch {
    throw new Error('Não foi possível conectar à administração. Tente novamente.');
  }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const conflict = 'Outra edição alterou este caminho. Suas alterações foram mantidas. Recarregue a versão atual antes de salvar novamente.';
    throw new Error(response.status === 409 ? conflict : data?.error?.message || 'Administração indisponível. Verifique a configuração do serviço.');
  }
  if (!data) throw new Error('Resposta inválida do serviço administrativo.');
  return data;
}
