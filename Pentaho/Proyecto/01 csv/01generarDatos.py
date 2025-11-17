import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

# Configuración
np.random.seed(42)
fecha_inicio = datetime(2024, 1, 1)
fecha_fin = datetime(2024, 12, 5)
dias = (fecha_fin - fecha_inicio).days

# 1. GENERAR PRODUCTOS
productos = pd.DataFrame({
    'id_producto': range(501, 551),
    'nombre': [f'Producto {i}' for i in range(1, 51)],
    'categoria': np.random.choice(['Electrónica', 'Ropa', 'Alimentos', 'Hogar', 'Deportes'], 50),
    'precio': np.round(np.random.uniform(10, 1000, 50), 2),
    'stock': np.random.randint(10, 500, 50)
})
productos.to_csv('productos.csv', index=False)
print("✓ productos.csv generado")

# 2. GENERAR CLIENTES
nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Laura', 'Pedro', 'Carmen', 'Miguel', 'Sofia']
apellidos = ['García', 'López', 'Martínez', 'González', 'Rodríguez', 'Pérez', 'Sánchez', 'Torres', 'Flores', 'Rivera']
ciudades = ['Ambato', 'Quito', 'Cuenca', 'Guayaquil', 'Riobamba']

clientes = pd.DataFrame({
    'id_cliente': range(101, 601),
    'nombre': [random.choice(nombres) for _ in range(500)],
    'apellido': [random.choice(apellidos) for _ in range(500)],
    'email': [f'cliente{i}@email.com' for i in range(500)],
    'ciudad': np.random.choice(ciudades, 500),
    'genero': np.random.choice(['M', 'F'], 500),
    'edad': np.random.randint(18, 70, 500)
})
clientes.to_csv('clientes.csv', index=False)
print("✓ clientes.csv generado")

# 3. GENERAR SUCURSALES
sucursales = pd.DataFrame({
    'id_sucursal': [1, 2, 3, 4, 5],
    'nombre': ['Centro', 'Norte', 'Sur', 'Este', 'Oeste'],
    'ciudad': ['Ambato', 'Quito', 'Cuenca', 'Guayaquil', 'Riobamba'],
    'gerente': ['Pedro R.', 'Laura S.', 'Miguel T.', 'Carmen F.', 'Ana M.'],
    'area_m2': [250, 300, 200, 350, 280]
})
sucursales.to_csv('sucursales.csv', index=False)
print("✓ sucursales.csv generado")

# 4. GENERAR VENTAS (5000 registros)
fechas_ventas = [fecha_inicio + timedelta(days=random.randint(0, dias)) for _ in range(5000)]

ventas = pd.DataFrame({
    'id_venta': range(1, 5001),
    'fecha': sorted(fechas_ventas),
    'id_cliente': np.random.randint(101, 601, 5000),
    'id_producto': np.random.randint(501, 551, 5000),
    'id_sucursal': np.random.randint(1, 6, 5000),
    'cantidad': np.random.randint(1, 10, 5000),
})

# Agregar precios y calcular totales
ventas = ventas.merge(productos[['id_producto', 'precio']], on='id_producto')
ventas['precio_unitario'] = ventas['precio']
ventas['descuento'] = np.random.choice([0, 5, 10, 15], 5000, p=[0.7, 0.15, 0.1, 0.05])
ventas['subtotal'] = ventas['cantidad'] * ventas['precio_unitario']
ventas['total'] = ventas['subtotal'] * (1 - ventas['descuento']/100)
ventas['metodo_pago'] = np.random.choice(['Efectivo', 'Tarjeta', 'Transferencia'], 5000)

ventas = ventas[['id_venta', 'fecha', 'id_cliente', 'id_producto', 'id_sucursal', 
                 'cantidad', 'precio_unitario', 'total', 'descuento', 'metodo_pago']]
ventas['fecha'] = ventas['fecha'].dt.strftime('%Y-%m-%d')
ventas.to_csv('ventas.csv', index=False)
print("✓ ventas.csv generado (5000 registros)")

# 5. GENERAR DATOS DE CLIMA
fechas_clima = pd.date_range(fecha_inicio, fecha_fin, freq='D')
clima_registros = []

for fecha in fechas_clima:
    for ciudad in ciudades:
        clima_registros.append({
            'fecha': fecha.strftime('%Y-%m-%d'),
            'ciudad': ciudad,
            'temperatura_max': round(random.uniform(15, 30), 1),
            'temperatura_min': round(random.uniform(8, 18), 1),
            'humedad': random.randint(40, 90),
            'precipitacion': round(random.uniform(0, 20), 1) if random.random() > 0.7 else 0,
            'condicion': random.choice(['Soleado', 'Nublado', 'Lluvia', 'Parcialmente nublado'])
        })

clima = pd.DataFrame(clima_registros)
clima.to_csv('clima.csv', index=False)
print(f"✓ clima.csv generado ({len(clima)} registros)")

# 6. GENERAR DATOS DE REDES SOCIALES
fechas_redes = pd.date_range(fecha_inicio, fecha_fin, freq='D')
redes_registros = []

for fecha in fechas_redes:
    for _ in range(random.randint(10, 30)):  # 10-30 menciones por día
        redes_registros.append({
            'fecha': fecha.strftime('%Y-%m-%d'),
            'plataforma': random.choice(['Twitter', 'Facebook', 'Instagram', 'TikTok']),
            'menciones': random.randint(1, 200),
            'sentimiento': random.choice(['Positivo', 'Neutral', 'Negativo']),
            'likes': random.randint(10, 1000),
            'shares': random.randint(5, 500),
            'comentarios': random.randint(0, 100),
            'id_producto': random.randint(501, 551)
        })

redes_sociales = pd.DataFrame(redes_registros)
redes_sociales.to_csv('redes_sociales.csv', index=False)
print(f"✓ redes_sociales.csv generado ({len(redes_sociales)} registros)")

print("\n¡Todos los archivos CSV han sido generados exitosamente!")
print("\nArchivos creados:")
print("- productos.csv (50 productos)")
print("- clientes.csv (500 clientes)")
print("- sucursales.csv (5 sucursales)")
print("- ventas.csv (5000 ventas)")
print(f"- clima.csv ({len(clima)} registros)")
print(f"- redes_sociales.csv ({len(redes_sociales)} registros)")