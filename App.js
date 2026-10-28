import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Pressable, 
  Image, 
  ScrollView, 
  ActivityIndicator, 
  SafeAreaView 
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';

export default function App() {
  const [seccionActiva, setSeccionActiva] = useState('camara'); // 'camara' | 'gps' | 'sensor'

  // camara
  const referenciaCamara = useRef(null);
  const [permisoCamara, solicitarPermisoCamara] = useCameraPermissions();
  const [imagenCapturada, setImagenCapturada] = useState(null);

  const capturarFoto = async () => {
    if (referenciaCamara.current) {
      const foto = await referenciaCamara.current.takePictureAsync();
      if (foto?.uri) {
        setImagenCapturada(foto.uri);
      }
    }
  };

  // ubicacion  
  const [datosGps, setDatosGps] = useState(null);
  const [cargandoGps, setCargandoGps] = useState(false);
  const [errorGps, setErrorGps] = useState(null);

  const consultarGps = async () => {
    setCargandoGps(true);
    setErrorGps(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorGps('Permiso de ubicación denegado.');
        setCargandoGps(false);
        return;
      }
      const posicion = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setDatosGps(posicion.coords);
    } catch (err) {
      setErrorGps('No se pudo obtener la posición GPS.');
    } finally {
      setCargandoGps(false);
    }
  };

  // brujula
  const [orientacion, setOrientacion] = useState({ x: 0, y: 0, z: 0 });
  const [grados, setGrados] = useState(0);
  const [sensorDisponible, setSensorDisponible] = useState(true);

  useEffect(() => {
    let suscripcion = null;

    const iniciarSensor = async () => {
      const disponible = await Magnetometer.isAvailableAsync();
      setSensorDisponible(disponible);

      if (disponible) {
        Magnetometer.setUpdateInterval(250);
        suscripcion = Magnetometer.addListener((datos) => {
          setOrientacion(datos);
          let calcAngulo = Math.atan2(datos.y, datos.x) * (180 / Math.PI);
          calcAngulo = (calcAngulo + 360) % 360;
          setGrados(Math.round(calcAngulo));
        });
      }
    };

    if (seccionActiva === 'sensor') {
      iniciarSensor();
    }

    return () => {
      if (suscripcion) suscripcion.remove();
    };
  }, [seccionActiva]);

  const obtenerPuntoCardinal = (deg) => {
    if (deg >= 337.5 || deg < 22.5) return 'Norte (N)';
    if (deg >= 22.5 && deg < 67.5) return 'Noreste (NE)';
    if (deg >= 67.5 && deg < 112.5) return 'Este (E)';
    if (deg >= 112.5 && deg < 157.5) return 'Sureste (SE)';
    if (deg >= 157.5 && deg < 202.5) return 'Sur (S)';
    if (deg >= 202.5 && deg < 247.5) return 'Suroeste (SO)';
    if (deg >= 247.5 && deg < 292.5) return 'Oeste (O)';
    if (deg >= 292.5 && deg < 337.5) return 'Noroeste (NO)';
    return 'Desconocido';
  };

  return (
    <SafeAreaView style={estilos.pantalla}>
      <Text style={estilos.encabezado}>Explorador Móvil</Text>

      {/*  nav por pestañas */}
      <View style={estilos.menuNavegacion}>
        <Pressable 
          style={[estilos.btnTab, seccionActiva === 'camara' && estilos.btnTabActivo]} 
          onPress={() => setSeccionActiva('camara')}
        >
          <Text style={seccionActiva === 'camara' ? estilos.txtTabActivo : estilos.txtTab}>Cámara</Text>
        </Pressable>

        <Pressable 
          style={[estilos.btnTab, seccionActiva === 'gps' && estilos.btnTabActivo]} 
          onPress={() => setSeccionActiva('gps')}
        >
          <Text style={seccionActiva === 'gps' ? estilos.txtTabActivo : estilos.txtTab}>Ubicación</Text>
        </Pressable>

        <Pressable 
          style={[estilos.btnTab, seccionActiva === 'sensor' && estilos.btnTabActivo]} 
          onPress={() => setSeccionActiva('sensor')}
        >
          <Text style={seccionActiva === 'sensor' ? estilos.txtTabActivo : estilos.txtTab}>Brújula</Text>
        </Pressable>
      </View>

      {/* camara */}
      {seccionActiva === 'camara' && (
        <View style={estilos.contenedorSeccion}>
          {!permisoCamara ? (
            <ActivityIndicator size="large" color="#4F46E5" />
          ) : !permisoCamara.granted ? (
            <View style={estilos.cajaAlerta}>
              <Text style={estilos.txtAlerta}>Se requieren permisos para usar la cámara.</Text>
              <Pressable style={estilos.btnAccion} onPress={solicitarPermisoCamara}>
                <Text style={estilos.txtBtnAccion}>Conceder Permiso</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ flex: 1, width: '100%' }}>
              <View style={estilos.marcoCamara}>
                <CameraView ref={referenciaCamara} style={{ flex: 1 }} facing="back" />
              </View>

              <Pressable style={estilos.btnAccion} onPress={capturarFoto}>
                <Text style={estilos.txtBtnAccion}>📸 Capturar Imagen</Text>
              </Pressable>

              {imagenCapturada && (
                <ScrollView style={estilos.vistaPrevia}>
                  <Text style={estilos.subtitulo}>Foto Capturada:</Text>
                  <Image source={{ uri: imagenCapturada }} style={estilos.imgPreview} />
                </ScrollView>
              )}
            </View>
          )}
        </View>
      )}

      {/* ubicacion */}
      {seccionActiva === 'gps' && (
        <View style={estilos.contenedorSeccion}>
          <Pressable style={estilos.btnAccion} onPress={consultarGps} disabled={cargandoGps}>
            <Text style={estilos.txtBtnAccion}>
              {cargandoGps ? 'Obteniendo GPS...' : '📍 Consultar Coordenadas'}
            </Text>
          </Pressable>

          {cargandoGps && <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#4F46E5" />}

          {errorGps && (
            <View style={estilos.cajaAlerta}>
              <Text style={estilos.txtAlerta}>{errorGps}</Text>
            </View>
          )}

          {datosGps && (
            <View style={estilos.tarjetaInfo}>
              <Text style={estilos.subtitulo}>Posición Reportada:</Text>
              <Text style={estilos.txtInfo}>Latitud: {datosGps.latitude.toFixed(6)}°</Text>
              <Text style={estilos.txtInfo}>Longitud: {datosGps.longitude.toFixed(6)}°</Text>
              <Text style={estilos.txtInfo}>Precisión: {datosGps.accuracy.toFixed(2)} m</Text>
            </View>
          )}
        </View>
      )}

      {/* brujula */}
      {seccionActiva === 'sensor' && (
        <View style={estilos.contenedorSeccion}>
          {!sensorDisponible ? (
            <View style={estilos.cajaAlerta}>
              <Text style={estilos.txtAlerta}>Magnetómetro no disponible en este dispositivo.</Text>
            </View>
          ) : (
            <View style={estilos.tarjetaInfo}>
              <Text style={estilos.txtGrados}>{grados}°</Text>
              <Text style={estilos.txtOrientacion}>{obtenerPuntoCardinal(grados)}</Text>

              <View style={estilos.divisor} />

              <Text style={estilos.subtitulo}>Componentes Magnéticos (µT):</Text>
              <Text style={estilos.txtInfo}>Eje X: {orientacion.x.toFixed(2)}</Text>
              <Text style={estilos.txtInfo}>Eje Y: {orientacion.y.toFixed(2)}</Text>
              <Text style={estilos.txtInfo}>Eje Z: {orientacion.z.toFixed(2)}</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop: 40,
  },
  encabezado: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1F2937',
    marginBottom: 15,
  },
  menuNavegacion: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#E5E7EB',
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 4,
    marginBottom: 15,
  },
  btnTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  btnTabActivo: {
    backgroundColor: '#4F46E5',
  },
  txtTab: {
    color: '#4B5563',
    fontWeight: '600',
  },
  txtTabActivo: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  contenedorSeccion: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  btnAccion: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  txtBtnAccion: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  marcoCamara: {
    height: 300,
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
  },
  vistaPrevia: {
    marginTop: 10,
    width: '100%',
  },
  imgPreview: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginTop: 5,
  },
  tarjetaInfo: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    elevation: 2,
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 5,
  },
  txtInfo: {
    fontSize: 15,
    color: '#4B5563',
    marginVertical: 2,
  },
  cajaAlerta: {
    backgroundColor: '#FEE2E2',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  txtAlerta: {
    color: '#DC2626',
    fontWeight: '500',
    textAlign: 'center',
  },
  txtGrados: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  txtOrientacion: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
  },
  divisor: {
    height: 1,
    backgroundColor: '#E5E7EB',
    width: '100%',
    marginVertical: 15,
  },
});