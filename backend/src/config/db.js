import mongoose from 'mongoose';

// Conexión a MongoDB.
//
// Si hay MONGO_URI (en el .env o en las variables del hosting) se conecta ahí.
// Esa es siempre la opción de producción, con MongoDB Atlas.
//
// Si no hay nada y estoy en desarrollo, levanta una base en memoria para poder
// probar el proyecto sin instalar MongoDB. Los datos se pierden al reiniciar,
// por eso este modo no se usa nunca en producción.
export const connectDB = async () => {
    const enProduccion = process.env.NODE_ENV === 'production';
    let uri = process.env.MONGO_URI;

    try {
        if (!uri) {
            if (enProduccion) {
                // En producción los datos tienen que quedar guardados, así que
                // si no hay URI mejor que no arranque y se note.
                console.error('Falta la variable MONGO_URI. En producción es obligatoria.');
                process.exit(1);
            }

            // El import va acá adentro a propósito: mongodb-memory-server es una
            // dependencia de desarrollo y así no se carga nunca en producción.
            const { MongoMemoryServer } = await import('mongodb-memory-server');
            const mem = await MongoMemoryServer.create();
            uri = mem.getUri();
            console.log('MongoDB: base en memoria (solo desarrollo, los datos no se guardan)');
            // Muestro la URI por si la quiero abrir con MongoDB Compass y mirar
            // los datos. Cambia en cada arranque porque el puerto es al azar.
            console.log(`MongoDB: para verla con Compass, conectate a  ${uri}`);
        }

        await mongoose.connect(uri);
        console.log('MongoDB conectado');
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error.message);
        process.exit(1);
    }
};

export default connectDB;
