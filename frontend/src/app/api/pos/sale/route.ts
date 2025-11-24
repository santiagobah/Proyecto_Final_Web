import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { items, total, paymentMethod = 'CASH' } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
    }

    const ticketNumber = `TICKET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const saleResult = await query(
      `INSERT INTO pos_sales (branch_id, cashier_id, ticket_number, subtotal, tax, total, status, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6, 'COMPLETED', $7)
       RETURNING pos_sale_id`,
      [
        1,             
        user.userId,    
        ticketNumber,   
        total,          
        0,              
        total,          
        paymentMethod   
      ]
    );

    const saleId = saleResult.rows[0].pos_sale_id;

    for (const item of items) {
      const prodRes = await query(
        `SELECT p.prod_id, p.name_pr FROM products p 
         JOIN barcodes b ON p.prod_id = b.prod_id 
         WHERE b.barcode = $1 LIMIT 1`,
        [item.barcode]
      );

      if (prodRes.rows.length > 0) {
        const prodId = prodRes.rows[0].prod_id;
        const prodName = prodRes.rows[0].name_pr;

        await query(
          `INSERT INTO pos_items (pos_sale_id, prod_id, product_name, quantity, unit_price, discount)
           VALUES ($1, $2, $3, $4, $5, 0)`,
          [saleId, prodId, prodName, item.qty, item.price]
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Venta registrada exitosamente',
      ticket: ticketNumber,
      saleId: saleId
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error al procesar venta:', error);
    return NextResponse.json(
      { error: 'Error al procesar la venta', details: error.message },
      { status: 500 }
    );
  }
}