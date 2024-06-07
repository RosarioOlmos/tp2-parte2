
//trabajo practico 2 grupo 6
//Olmos Rosario Maria 59487
//Manzano Gonzalo 58702
// https://lucid.app/lucidchart/6c99f215-d556-421f-a2be-e8f9fc2e923c/edit?page=0_0&invitationId=inv_14467378-a160-450a-9ed9-b2cc1a1d5f4a#



const { MongoClient, ObjectId } = require('mongodb');

async function main() {
  const uri = "mongodb://localhost:27017"; // Reemplaza con tu cadena de conexión de MongoDB
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const database = client.db('tienda');

    // Consulta 1: Obtener los pedidos de un cliente específico
    const pedidosDeCliente = await database.collection('pedidos').aggregate([
      { $match: { cliente_id: "id_cliente1" } },
      { $lookup: {
        from: "clientes",
        localField: "cliente_id",
        foreignField: "_id",
        as: "cliente_info"
      } }
    ]).toArray();

    console.log("Pedidos de Cliente (id_cliente1):");
    console.log(pedidosDeCliente);

    // Consulta 2: Obtener el total de pedidos por cada cliente
    const totalPedidosPorCliente = await database.collection('pedidos').aggregate([
      { $group: {
        _id: "$cliente_id",
        totalPedidos: { $sum: 1 },
        totalGastado: { $sum: "$total" }
      } },
      { $lookup: {
        from: "clientes",
        localField: "_id",
        foreignField: "_id",
        as: "cliente_info"
      } }
    ]).toArray();

    console.log("Total de Pedidos por Cliente:");
    console.log(totalPedidosPorCliente);

    // Consulta 3: Obtener los productos de un pedido específico
    const productosDePedido = await database.collection('pedidos').aggregate([
      { $match: { _id: "id_pedido1" } },
      { $unwind: "$productos" },
      { $lookup: {
        from: "productos",
        localField: "productos.producto_id",
        foreignField: "_id",
        as: "producto_info"
      } }
    ]).toArray();

    console.log("Productos de Pedido (id_pedido1):");
    console.log(productosDePedido);

    // Consulta 4: Obtener el total de productos vendidos por cada producto
    const totalProductosVendidos = await database.collection('pedidos').aggregate([
      { $unwind: "$productos" },
      { $group: {
        _id: "$productos.producto_id",
        totalVendidos: { $sum: "$productos.cantidad" }
      } },
      { $lookup: {
        from: "productos",
        localField: "_id",
        foreignField: "_id",
        as: "producto_info"
      } }
    ]).toArray();

    console.log("Total de Productos Vendidos:");
    console.log(totalProductosVendidos);

  } finally {
    await client.close();
  }
}

main().catch(console.error);
