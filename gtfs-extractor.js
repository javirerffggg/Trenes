/**
 * GTFS Extractor para Cercanías Cádiz
 * Este script descarga los datos oficiales de Renfe y genera el JSON para la PWA.
 * Optimizado para ejecución local y automática (GitHub Actions).
 */

const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');
const path = require('path');

const GTFS_URL = 'https://ssl.renfe.com/ftransit/Fichero_CER_FOMENTO/fomento_transit.zip';
const OUTPUT_DIR = './public/data';
const TEMP_DIR = './temp_gtfs';

// IDs oficiales de estaciones del núcleo de Cádiz (C1 y C1a)
const CADIZ_STATION_IDS = [
    '51405', '51404', '51403', '51402', '51401', // Cádiz ciudad
    '51306', '51305', '51304', '51303', '51302', // San Fernando / Puerto Real / Valdelagrana
    '51301', '51201', '51202', '51310'           // El Puerto / Jerez / Aeropuerto / Universidad
];

async function run() {
    console.log('🚀 Iniciando proceso de actualización de datos...');

    try {
        // Asegurar directorios
        if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        if (fs.existsSync(TEMP_DIR)) fs.rmSync(TEMP_DIR, { recursive: true, force: true });
        fs.mkdirSync(TEMP_DIR);

        const zipPath = path.join(TEMP_DIR, 'gtfs.zip');

        // 1. Descarga
        console.log('📥 Descargando GTFS desde Renfe...');
        await downloadFile(GTFS_URL, zipPath);

        // 2. Extracción
        console.log('📦 Extrayendo archivos del dataset...');
        if (process.platform === 'win32') {
            execSync(`powershell Expand-Archive -Path ${zipPath} -DestinationPath ${TEMP_DIR} -Force`);
        } else {
            execSync(`unzip -o ${zipPath} -d ${TEMP_DIR}`);
        }

        // 3. Procesamiento
        console.log('🔍 Filtrando servicios de la Bahía de Cádiz...');
        
        const trips = parseCSV(path.join(TEMP_DIR, 'trips.txt'));
        const stopTimes = parseCSV(path.join(TEMP_DIR, 'stop_times.txt'));

        // Mapeo de paradas por trayecto
        const schedules = {};
        stopTimes.forEach(st => {
            if (CADIZ_STATION_IDS.includes(st.stop_id)) {
                if (!schedules[st.trip_id]) schedules[st.trip_id] = [];
                schedules[st.trip_id].push({
                    sId: st.stop_id,
                    t: st.departure_time.substring(0, 5),
                    seq: parseInt(st.stop_sequence)
                });
            }
        });

        const finalData = [];
        Object.keys(schedules).forEach(tripId => {
            const tripStops = schedules[tripId].sort((a, b) => a.seq - b.seq);
            
            // Solo guardamos trayectos que tengan sentido (más de una parada en nuestra zona)
            if (tripStops.length > 1) {
                const tripInfo = trips.find(t => t.trip_id === tripId);
                const routeId = tripInfo ? tripInfo.route_id : '';
                
                finalData.push({
                    id: tripId,
                    line: routeId.includes('C1A') ? 'C1a' : 'C1',
                    stops: tripStops.map(s => ({ id: s.sId, t: s.t }))
                });
            }
        });

        // 4. Guardado final
        const outputPath = path.join(OUTPUT_DIR, 'schedules_cadiz.json');
        fs.writeFileSync(outputPath, JSON.stringify({
            lastUpdate: new Date().toISOString(),
            services: finalData
        }, null, 2));

        console.log(`✅ Proceso finalizado con éxito.`);
        console.log(`📝 Archivo generado: ${outputPath} (${finalData.length} servicios)`);

        // Limpieza
        fs.rmSync(TEMP_DIR, { recursive: true, force: true });

    } catch (error) {
        console.error('❌ Error crítico durante la ejecución:', error.message);
        process.exit(1);
    }
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Fallo en descarga: Código ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => file.close(resolve));
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
}

function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    if (lines.length === 0) return [];

    const headers = lines[0].trim().split(',');
    return lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
            const values = line.split(',');
            const obj = {};
            headers.forEach((h, i) => {
                // Limpiar posibles comillas de los valores CSV
                obj[h] = values[i] ? values[i].replace(/"/g, '') : '';
            });
            return obj;
        });
}

run();
