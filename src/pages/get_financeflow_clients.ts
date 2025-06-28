import type { NextApiRequest, NextApiResponse } from 'next';

type Client = {
  id: string;
  name: string;
  // outros campos que seu cliente tenha
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: 'user_id é obrigatório' });
  }

  try {
    // Aqui você pode consultar seu banco de dados, ou API externa, etc
    // Vou simular dados para exemplificar:
    const allClients: Client[] = [
      { id: '1', name: 'Cliente A' },
      { id: '2', name: 'Cliente B' },
      { id: '3', name: '[ARQUIVADO] Cliente C' }
    ];

    // Aqui poderia filtrar clientes do user_id, se fizer sentido no seu backend

    return res.status(200).json({ data: allClients });
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}
