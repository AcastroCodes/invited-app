import XLSX from 'xlsx';
import fs from 'fs';

const data = [
  [
    'Nombre de la Tarjeta',
    'Trato',
    'Nombre Completo',
    'Rol',
    'Categoria',
    'Email Contacto',
    'Telefono Contacto',
    'WhatsApp Contacto',
  ],
  [
    'Familia Castro Pérez',
    'Sr.',
    'Aristides Castro',
    'Principal',
    'Adulto',
    'aristides@ejemplo.com',
    '+584120000000',
    '+584120000000',
  ],
  [
    'Familia Castro Pérez',
    'Sra.',
    'María Pérez',
    'Esposa',
    'Adulto',
    'aristides@ejemplo.com',
    '+584120000000',
    '+584120000000',
  ],
  [
    'Familia Castro Pérez',
    'Srito.',
    'Aristides Jr. Castro',
    'Hijo',
    'Joven',
    'aristides@ejemplo.com',
    '+584120000000',
    '+584120000000',
  ],
  [
    'Sr. Juan Mendoza',
    'Sr.',
    'Juan Mendoza',
    'Principal',
    'Adulto',
    'juan@ejemplo.com',
    '+584141112233',
    '+584141112233',
  ],
];

const worksheet = XLSX.utils.aoa_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Invitados');

const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
fs.writeFileSync('invitadoexcel.xlsx', buffer);
console.log('invitadoexcel.xlsx creado exitosamente');
