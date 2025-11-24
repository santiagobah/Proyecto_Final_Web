import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
  name_p: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  ap_pat: z.string().min(2, 'El apellido paterno debe tener al menos 2 caracteres'),
  ap_mat: z.string().optional(),
  sell: z.boolean().default(false),
  buy: z.boolean().default(true),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export const productSchema = z.object({
  name_pr: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  cat_id: z.number().int().positive('Debe seleccionar una categoría'),
  price: z.number().positive('El precio debe ser mayor a 0'),
  stock: z.number().int().min(0, 'El stock no puede ser negativo'),
  barcode: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
});

export const categorySchema = z.object({
  name_cat: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
});

export const saleSchema = z.object({
  items: z.array(z.object({
    prod_id: z.number().int().positive(),
    quantity: z.number().int().positive(),
    unit_price: z.number().positive(),
  })).min(1, 'Debe agregar al menos un producto'),
  payment_method: z.enum(['cash', 'credit_card', 'debit_card', 'transfer']),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type SaleInput = z.infer<typeof saleSchema>;
