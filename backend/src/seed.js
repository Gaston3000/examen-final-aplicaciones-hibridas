import bcrypt from 'bcryptjs';
import Categoria from './models/categoriaModel.js';
import Estadio from './models/estadioModel.js';
import Usuario from './models/usuarioModel.js';

// Los datos con los que arranca la app.
// Está hecho para poder correrlo mil veces sin que se dupliquen los registros:
// antes de crear cada cosa se fija si ya estaba.

const CATEGORIAS = [
    { nombre: 'Sede de la Final', descripcion: 'El estadio que recibe el partido decisivo del torneo.' },
    { nombre: 'Sede Premium', descripcion: 'Estadios de gran capacidad para los partidos más convocantes.' },
    { nombre: 'Sede Tecnológica', descripcion: 'Sedes con la infraestructura más moderna del Mundial.' },
    { nombre: 'Sede Exclusiva', descripcion: 'Sedes con una experiencia internacional y de alto perfil.' }
];

const ESTADIOS = [
    {
        nombre: 'New York New Jersey Stadium',
        ciudad: 'East Rutherford',
        estado: 'Nueva Jersey',
        categoria: 'Sede de la Final',
        precio: 1250000000,
        capacidad: 82500,
        imagen: '/estadios/new-york.jpg',
        descripcion:
            'Sede premium del Mundial 2026, pensada para noches históricas, finales inolvidables y eventos de escala mundial.'
    },
    {
        nombre: 'Dallas Stadium',
        ciudad: 'Dallas',
        estado: 'Texas',
        categoria: 'Sede Premium',
        precio: 890000000,
        capacidad: 80000,
        imagen: '/estadios/dallas.jpg',
        descripcion:
            'Un estadio imponente, moderno y preparado para recibir partidos masivos con una experiencia visual de alto impacto.'
    },
    {
        nombre: 'Los Angeles Stadium',
        ciudad: 'Los Ángeles',
        estado: 'California',
        categoria: 'Sede Tecnológica',
        precio: 1100000000,
        capacidad: 70240,
        imagen: '/estadios/los-angeles.jpg',
        descripcion:
            'Una sede cinematográfica, tecnológica y elegante, ideal para vivir el Mundial con una estética moderna y global.'
    },
    {
        nombre: 'Miami Stadium',
        ciudad: 'Miami',
        estado: 'Florida',
        categoria: 'Sede Exclusiva',
        precio: 760000000,
        capacidad: 65326,
        imagen: '/estadios/miami.jpg',
        descripcion:
            'Una sede vibrante, cálida y exclusiva, con energía internacional y una experiencia mundialista única.'
    }
];

// Crea las categorías que falten y me devuelve un { nombre -> _id },
// que después uso para enganchar cada estadio con la suya.
const cargarCategorias = async () => {
    const mapa = {};

    for (const datos of CATEGORIAS) {
        let categoria = await Categoria.findOne({ nombre: datos.nombre });
        if (!categoria) {
            categoria = await Categoria.create(datos);
        }
        mapa[categoria.nombre] = categoria._id;
    }

    return mapa;
};

// Crea los estadios que falten, ya apuntando al _id real de su categoría.
const cargarEstadios = async (mapaCategorias) => {
    let creados = 0;

    for (const datos of ESTADIOS) {
        const existe = await Estadio.findOne({ nombre: datos.nombre });
        if (existe) continue;

        await Estadio.create({
            ...datos,
            categoria: mapaCategorias[datos.categoria]
        });
        creados++;
    }

    return creados;
};

// El admin de demo. Está documentado en el README y solo se usa en desarrollo,
// para que el proyecto ande apenas lo clonás, sin tener que configurar el .env.
const ADMIN_DEMO = { email: 'admin@worldcup26.com', password: 'admin123456' };

// Crea el admin del principio. En producción los datos salen sí o sí del .env,
// para no dejar ninguna contraseña de verdad escrita en el repo.
const cargarAdmin = async () => {
    const enProduccion = process.env.NODE_ENV === 'production';
    let email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    let password = process.env.ADMIN_PASSWORD;
    const nombre = process.env.ADMIN_NAME || 'Administrador';

    if (!email || !password) {
        if (enProduccion) {
            console.warn(
                'Seed: no se creó el administrador (faltan ADMIN_EMAIL y ADMIN_PASSWORD en el .env)'
            );
            return false;
        }
        // En local uso el de demo así el panel se puede probar de una.
        email = ADMIN_DEMO.email;
        password = ADMIN_DEMO.password;
        console.log(`Seed: sin ADMIN_EMAIL en el .env, uso el admin de demo (${email} / ${password})`);
    }

    const existe = await Usuario.findOne({ email });
    if (existe) return false;

    await Usuario.create({
        nombre,
        email,
        password: await bcrypt.hash(password, 10),
        rol: 'admin'
    });

    console.log(`Seed: usuario administrador creado (${email})`);
    return true;
};

export const cargarDatosIniciales = async () => {
    try {
        const mapaCategorias = await cargarCategorias();
        const estadiosCreados = await cargarEstadios(mapaCategorias);
        await cargarAdmin();

        if (estadiosCreados > 0) {
            console.log(`Seed: ${estadiosCreados} estadio(s) de ejemplo cargados`);
        }
    } catch (error) {
        console.error('Seed: error al cargar los datos iniciales:', error.message);
    }
};

export default cargarDatosIniciales;
