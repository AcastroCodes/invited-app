<?php

// Script para crear el archivo Excel plantilla de invitados
$csvContent = "\xEF\xBB\xBF"; // UTF-8 BOM para que Excel lo abra correctamente
$csvContent .= "Nombre de la Tarjeta;Trato;Nombre Completo;Rol;Categoria;Restricciones Alimenticias;Email Contacto;Telefono Contacto;WhatsApp Contacto\n";
$csvContent .= "Familia Castro Pérez;Sr.;Aristides Castro;Principal;Adulto;Ninguna;aristides@ejemplo.com;+584120000000;+584120000000\n";
$csvContent .= "Familia Castro Pérez;Sra.;María Pérez;Esposa;Adulto;Vegetariano;aristides@ejemplo.com;+584120000000;+584120000000\n";
$csvContent .= "Familia Castro Pérez;Srito.;Aristides Jr. Castro;Hijo;Joven;Sin lactosa;aristides@ejemplo.com;+584120000000;+584120000000\n";
$csvContent .= "Sr. Juan Mendoza;Sr.;Juan Mendoza;Principal;Adulto;;juan@ejemplo.com;+584141112233;+584141112233\n";

file_put_contents('invitadoexcel.csv', $csvContent);
echo "invitadoexcel.csv creado exitosamente.\n";
