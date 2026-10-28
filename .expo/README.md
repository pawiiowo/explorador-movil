# Explorador Móvil - React Native & Expo

Aplicación móvil desarrollada con Expo y React Native que permite capturar fotografías con la cámara, consultar la ubicación actual por GPS y visualizar la orientación con el sensor magnetómetro.

## Requisitos de instalación

1. **Clonar este repositorio:**
   ```bash
   git clone https://github.com/pawiiowo/explorador-movil.git
   cd explorador-movil
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npx expo start
   ```

4. **Probar en tu dispositivo:**
   * Abre la app **Expo Go** en tu teléfono y escanea el código QR proyectado en la terminal.

---

## Funcionalidades y Sensores Utilizados

### 1. Módulo de Cámara (`expo-camera`)
* Solicitud de permisos para la cámara del dispositivo.
* Vista previa en tiempo real usando `CameraView`.
* Captura de fotografía y despliegue del resultado usando el componente `Image` de React Native.

### 2. Módulo de Ubicación (`expo-location`)
* Gestión de permisos de ubicación en primer plano (`requestForegroundPermissionsAsync`).
* Obtención de coordenadas en tiempo real (latitud y longitud) y margen de precisión reportado en metros.
* Indicador de carga (`ActivityIndicator`) y manejo de errores por rechazo de permisos.

### 3. Módulo de Brújula (`expo-sensors`)
* Lectura de componentes magnéticos (ejes X, Y, Z en $\mu\text{T}$) mediante `Magnetometer`.
* Cálculo del ángulo en grados ($0^\circ - 360^\circ$) para determinar el punto de orientación.
* Validación de disponibilidad del sensor e implementación de eliminacion de suscripciones en `useEffect`.

---

## Limitaciones Conocidas

* **Dispositivo físico obligatorio:** La aplicación requiere ejecutarse en un teléfono físico, ya que los simuladores o emuladores de escritorio suelen carecer de soporte para cámara, magnetómetro o datos GPS en tiempo real.
* **Posición del dispositivo:** La orientación calculada con el magnetómetro asume que el teléfono se mantiene en una posición relativamente horizontal respecto al suelo.
* **Interferencia magnética:** Las lecturas de la brújula pueden sufrir desviaciones debido a interferencias locales (cerca de metales o dispositivos electrónicos) o si el sensor del teléfono no se encuentra calibrado.

---

## Reflexión sobre el Desarrollo

Durante la implementación de esta aplicación móvil, uno de los mayores retos fue la gestión adecuada de los permisos del sistema operativo y los estados de carga para evitar bloquear la experiencia del usuario. El manejo de la cámara pide validar el estado del permiso antes de renderizar la vista, dando un comportamiento estable si el usuario decide denegarlo.

En cuanto a los sensores, existe una diferencia clave entre la ubicación por GPS y la orientación del magnetómetro:
* El **GPS** depende de señales satelitales y triangulación para calcular latitud, longitud y precisión métrica.
* El **Magnetómetro** lee el campo magnético terrestre local en microteslas ($\mu\text{T}$). Este último es susceptible a interferencias electromagnéticas cercanas, por lo que la brújula indica un norte magnético aproximado y requiere un contexto de uso adecuado.