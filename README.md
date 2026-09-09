# Sistema Corporativo de Solicitudes - Demo

Demo estatica navegable para validar una mesa de ayuda corporativa similar en flujo a InvGate.

## Alcance

- Tecnologia / Sistemas
- Marketing
- Talento / RRHH
- Tarjetas / medios de pago
- Negocios / precios / reportes

Fuera del alcance del MVP: Mantenimiento, Compras no productivas, Operaciones CD sin flujo definido y Seguridad e Higiene.

## Deploy en Render

Tipo de servicio: Web Service

- Build command: vacio
- Start command: `node server.js`
- Variable requerida: `DEMO_PASSWORD`

La demo usa datos ficticios y no requiere base de datos. La clave se define como variable secreta en Render, no en el codigo.
