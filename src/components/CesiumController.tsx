'use client';

import { useEffect, useRef } from 'react';
import type { Map } from 'ol';

interface CesiumControllerProps {
  map: Map | null;
  enabled: boolean;
  activeBasemap?: string;
  backgroundColor?: string;
  enableAtmosphere?: boolean;
  atmosphereSaturationShift?: number;
  atmosphereBrightnessShift?: number;
}

interface WindowWithCesium extends Window {
  CESIUM_BASE_URL?: string;
  Cesium?: {
    Ion?: {
      defaultAccessToken: string;
    };
    SkyBox?: new (options: {
      sources: {
        positiveX: string;
        negativeX: string;
        positiveY: string;
        negativeY: string;
        positiveZ: string;
        negativeZ: string;
      };
      show?: boolean;
    }) => unknown;
    Sun?: new () => unknown;
    Moon?: new () => unknown;
    createWorldTerrainAsync?: () => Promise<unknown>;
    OpenStreetMapImageryProvider?: new (options: { url: string }) => unknown;
    UrlTemplateImageryProvider?: new (options: {
      url: string;
      subdomains?: string[] | string;
      maximumLevel?: number;
      credit?: string;
    }) => unknown;
    Color?: {
      fromCssColorString: (color: string) => unknown;
      BLACK: unknown;
      WHITE: unknown;
      TRANSPARENT: unknown;
    };
  };
  olcs?: {
    OLCesium: new (options: { map: Map }) => {
      getCesiumScene: () => {
        canvas?: HTMLCanvasElement;
        terrainProvider: unknown;
        backgroundColor?: unknown;
        sun?: { show?: boolean };
        sunBloom?: boolean;
        moon?: { show?: boolean };
        skyBox?: { show?: boolean };
        skyAtmosphere?: {
          show?: boolean;
          saturationShift?: number;
          brightnessShift?: number;
        };
        globe?: {
          enableLighting?: boolean;
          dynamicAtmosphereLighting?: boolean;
          dynamicAtmosphereLightingFromSun?: boolean;
          depthTestAgainstTerrain?: boolean;
          showGroundAtmosphere?: boolean;
          show?: boolean;
          baseColor?: unknown;
          nightColor?: unknown;
          atmosphereSaturationShift?: number;
          atmosphereBrightnessShift?: number;
        };
        imageryLayers?: {
          length: number;
          removeAll?: (destroy?: boolean) => void;
          remove: (layer: unknown, destroy?: boolean) => boolean;
          addImageryProvider: (provider: unknown, index?: number) => unknown;
        };
      };
      setEnabled: (enabled: boolean) => void;
      getEnabled: () => boolean;
      destroy?: () => void;
    };
  };
}

function setupCesiumBasemap(
  scene: {
    imageryLayers?: {
      length: number;
      remove: (layer: unknown, destroy?: boolean) => boolean;
      addImageryProvider: (provider: unknown, index?: number) => unknown;
    };
  },
  Cesium: WindowWithCesium['Cesium'],
  basemapId: string = 'osm',
  currentBasemapLayers: unknown[] = []
): unknown[] {
  if (!scene.imageryLayers || !Cesium) return currentBasemapLayers;

  const newLayers: unknown[] = [];

  try {
    // Remove previous custom basemap layers without destroying vector or other scene layers
    currentBasemapLayers.forEach((layer) => {
      try {
        scene.imageryLayers?.remove(layer, true);
      } catch {
        // ignore removal error
      }
    });

    if (basemapId === 'satellite') {
      if (Cesium.UrlTemplateImageryProvider) {
        // Layer 1: High-resolution Earth Satellite Imagery
        const satelliteProvider = new Cesium.UrlTemplateImageryProvider({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          maximumLevel: 19,
          credit:
            'Imagery © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        });
        const l1 = scene.imageryLayers.addImageryProvider(satelliteProvider, 0);
        if (l1) newLayers.push(l1);

        // Layer 2: Global Hybrid Reference Overlay (Countries, Provinces/States, Cities, Oceans, Places)
        const referenceLabelsProvider = new Cesium.UrlTemplateImageryProvider({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          maximumLevel: 19,
          credit: 'Boundaries & Places © Esri',
        });
        const l2 = scene.imageryLayers.addImageryProvider(referenceLabelsProvider, 1);
        if (l2) newLayers.push(l2);
      }
    } else if (basemapId === 'topo') {
      if (Cesium.UrlTemplateImageryProvider) {
        const topoProvider = new Cesium.UrlTemplateImageryProvider({
          url: 'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
          maximumLevel: 17,
          credit: '© OpenTopoMap contributors',
        });
        const l = scene.imageryLayers.addImageryProvider(topoProvider, 0);
        if (l) newLayers.push(l);
      }
    } else if (basemapId === 'dark') {
      if (Cesium.UrlTemplateImageryProvider) {
        const darkProvider = new Cesium.UrlTemplateImageryProvider({
          url: 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          maximumLevel: 19,
          credit: '© CARTO',
        });
        const l = scene.imageryLayers.addImageryProvider(darkProvider, 0);
        if (l) newLayers.push(l);
      }
    } else {
      // Default: OpenStreetMap ('osm')
      if (Cesium.OpenStreetMapImageryProvider) {
        const osmProvider = new Cesium.OpenStreetMapImageryProvider({
          url: 'https://tile.openstreetmap.org/',
        });
        const l = scene.imageryLayers.addImageryProvider(osmProvider, 0);
        if (l) newLayers.push(l);
      } else if (Cesium.UrlTemplateImageryProvider) {
        const osmProvider = new Cesium.UrlTemplateImageryProvider({
          url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          maximumLevel: 19,
          credit: '© OpenStreetMap contributors',
        });
        const l = scene.imageryLayers.addImageryProvider(osmProvider, 0);
        if (l) newLayers.push(l);
      }
    }
  } catch (err) {
    console.warn('Could not setup Cesium basemap:', err);
  }

  return newLayers;
}

export default function CesiumController({
  map,
  enabled,
  activeBasemap = 'osm',
  backgroundColor,
  enableAtmosphere = true,
  atmosphereSaturationShift = 0.0,
  atmosphereBrightnessShift = 0.0,
}: CesiumControllerProps) {
  const basemapLayersRef = useRef<unknown[]>([]);
  const ol3dRef = useRef<{
    getCesiumScene: () => {
      canvas?: HTMLCanvasElement;
      terrainProvider: unknown;
      backgroundColor?: unknown;
      sun?: { show?: boolean };
      sunBloom?: boolean;
      moon?: { show?: boolean };
      skyBox?: { show?: boolean };
      skyAtmosphere?: {
        show?: boolean;
        saturationShift?: number;
        brightnessShift?: number;
      };
      globe?: {
        enableLighting?: boolean;
        dynamicAtmosphereLighting?: boolean;
        dynamicAtmosphereLightingFromSun?: boolean;
        depthTestAgainstTerrain?: boolean;
        showGroundAtmosphere?: boolean;
        show?: boolean;
        baseColor?: unknown;
        nightColor?: unknown;
        atmosphereSaturationShift?: number;
        atmosphereBrightnessShift?: number;
      };
      imageryLayers?: {
        length: number;
        remove: (layer: unknown, destroy?: boolean) => boolean;
        addImageryProvider: (provider: unknown, index?: number) => unknown;
      };
    };
    setEnabled: (enabled: boolean) => void;
    getEnabled: () => boolean;
    destroy?: () => void;
  } | null>(null);

  const isInitializingRef = useRef(false);

  // Dynamic Scene updates for atmosphere, background, stars, lighting, and basemap
  useEffect(() => {
    if (!ol3dRef.current || !enabled) return;
    const win = window as unknown as WindowWithCesium;
    const Cesium = win.Cesium;
    if (!Cesium) return;

    try {
      const scene = ol3dRef.current.getCesiumScene();
      if (!scene) return;

      if (scene.skyBox) {
        scene.skyBox.show = true;
      }

      if (backgroundColor && Cesium.Color && scene.backgroundColor !== undefined) {
        scene.backgroundColor = Cesium.Color.fromCssColorString(backgroundColor);
      } else if (Cesium.Color && scene.backgroundColor !== undefined) {
        scene.backgroundColor = Cesium.Color.TRANSPARENT;
      }

      if (scene.globe) {
        scene.globe.showGroundAtmosphere = enableAtmosphere;
        scene.globe.atmosphereSaturationShift = atmosphereSaturationShift;
        scene.globe.atmosphereBrightnessShift = atmosphereBrightnessShift;
        scene.globe.enableLighting = true;
        scene.globe.dynamicAtmosphereLighting = true;
        scene.globe.dynamicAtmosphereLightingFromSun = true;
      }

      if (scene.sun) {
        scene.sun.show = true;
      }
      scene.sunBloom = true;

      if (scene.moon) {
        scene.moon.show = true;
      }

      if (scene.skyAtmosphere) {
        scene.skyAtmosphere.show = enableAtmosphere;
        scene.skyAtmosphere.saturationShift = atmosphereSaturationShift;
        scene.skyAtmosphere.brightnessShift = atmosphereBrightnessShift;
      }

      // Synchronize basemap in 3D scene
      basemapLayersRef.current = setupCesiumBasemap(
        scene,
        Cesium,
        activeBasemap,
        basemapLayersRef.current
      );
    } catch {
      // Ignore update errors
    }
  }, [
    backgroundColor,
    enableAtmosphere,
    atmosphereSaturationShift,
    atmosphereBrightnessShift,
    activeBasemap,
    enabled,
  ]);

  useEffect(() => {
    if (!map || typeof window === 'undefined') return;

    const win = window as unknown as WindowWithCesium;

    if (enabled) {
      if (ol3dRef.current) {
        try {
          ol3dRef.current.setEnabled(true);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const vecSync = (ol3dRef.current as any).getVectorSynchronizer?.();
          if (vecSync && typeof vecSync.synchronize === 'function') {
            vecSync.synchronize();
          }
          const scene = ol3dRef.current.getCesiumScene();
          if (scene && win.Cesium) {
            basemapLayersRef.current = setupCesiumBasemap(
              scene,
              win.Cesium,
              activeBasemap,
              basemapLayersRef.current
            );
          }
        } catch (e) {
          console.error('Error enabling Cesium 3D:', e);
        }
        return;
      }

      if (isInitializingRef.current) return;
      isInitializingRef.current = true;

      const tryInit = () => {
        const Cesium = win.Cesium;
        const OLCesium = win.olcs?.OLCesium;

        if (!Cesium || !OLCesium) {
          return false;
        }

        try {
          // Clear any expired demo token
          const customToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
          if (win.Cesium?.Ion) {
            win.Cesium.Ion.defaultAccessToken = customToken || '';
          }

          const ol3dInstance = new OLCesium({ map });
          ol3dRef.current = ol3dInstance;

          const scene = ol3dInstance.getCesiumScene();
          if (scene) {
            if (scene.canvas) {
              scene.canvas.style.position = 'absolute';
              scene.canvas.style.top = '0';
              scene.canvas.style.left = '0';
              scene.canvas.style.zIndex = '0';
              if (scene.canvas.parentElement) {
                scene.canvas.parentElement.classList.add('ol-cesium-container');
                scene.canvas.parentElement.style.position = 'absolute';
                scene.canvas.parentElement.style.top = '0';
                scene.canvas.parentElement.style.left = '0';
                scene.canvas.parentElement.style.zIndex = '0';
              }
            }

            // 1. Starfield Universe & Cosmic Background (Tycho-2 Star Catalog SkyBox)
            const baseUrl =
              win.CESIUM_BASE_URL ||
              'https://cesium.com/downloads/cesiumjs/releases/1.113/Build/Cesium/';

            if (!scene.skyBox && Cesium.SkyBox) {
              try {
                scene.skyBox = new Cesium.SkyBox({
                  sources: {
                    positiveX: `${baseUrl}Assets/Textures/SkyBox/tycho2t3_80_px.jpg`,
                    negativeX: `${baseUrl}Assets/Textures/SkyBox/tycho2t3_80_mx.jpg`,
                    positiveY: `${baseUrl}Assets/Textures/SkyBox/tycho2t3_80_py.jpg`,
                    negativeY: `${baseUrl}Assets/Textures/SkyBox/tycho2t3_80_my.jpg`,
                    positiveZ: `${baseUrl}Assets/Textures/SkyBox/tycho2t3_80_pz.jpg`,
                    negativeZ: `${baseUrl}Assets/Textures/SkyBox/tycho2t3_80_mz.jpg`,
                  },
                  show: true,
                }) as { show?: boolean };
              } catch (sbErr) {
                console.warn('Could not initialize SkyBox:', sbErr);
              }
            }

            if (scene.skyBox) {
              scene.skyBox.show = true;
            }

            if (backgroundColor && Cesium.Color && scene.backgroundColor !== undefined) {
              scene.backgroundColor = Cesium.Color.fromCssColorString(backgroundColor);
            } else if (Cesium.Color && scene.backgroundColor !== undefined) {
              scene.backgroundColor = Cesium.Color.TRANSPARENT;
            }

            // 2. Dynamic Sun & Celestial Environment (Matahari & Bulan Riil)
            if (scene.sun) {
              scene.sun.show = true;
            }
            scene.sunBloom = true;

            if (scene.moon) {
              scene.moon.show = true;
            }

            // 3. Globe Shading & Dynamic Sun Lighting (Pencahayaan dinamis & terminator siang/malam)
            if (scene.globe) {
              scene.globe.show = true;
              scene.globe.depthTestAgainstTerrain = false;
              scene.globe.enableLighting = true; // Pencahayaan matahari dinamis
              scene.globe.dynamicAtmosphereLighting = true;
              scene.globe.dynamicAtmosphereLightingFromSun = true;
              scene.globe.showGroundAtmosphere = enableAtmosphere;
              scene.globe.atmosphereSaturationShift = atmosphereSaturationShift;
              scene.globe.atmosphereBrightnessShift = atmosphereBrightnessShift;
              if (Cesium.Color) {
                scene.globe.baseColor = Cesium.Color.fromCssColorString('#0a1128'); // Deep ocean blue
                scene.globe.nightColor = Cesium.Color.fromCssColorString('#020914'); // Bayangan malam
              }
            }

            // 4. Earth Rayleigh Atmosphere (Atmosfer biru bumi alami)
            if (scene.skyAtmosphere) {
              scene.skyAtmosphere.show = enableAtmosphere;
              scene.skyAtmosphere.saturationShift = atmosphereSaturationShift;
              scene.skyAtmosphere.brightnessShift = atmosphereBrightnessShift;
            }

            // 5. Synchronize Basemap Imagery with 3D Globe
            basemapLayersRef.current = setupCesiumBasemap(
              scene,
              Cesium,
              activeBasemap,
              basemapLayersRef.current
            );
          }

          if (customToken && Cesium.createWorldTerrainAsync) {
            Cesium.createWorldTerrainAsync()
              .then((terrainProvider) => {
                if (ol3dRef.current && scene) {
                  scene.terrainProvider = terrainProvider;
                }
              })
              .catch(() => {
                // Fallback to ellipsoid terrain
              });
          }

          ol3dInstance.setEnabled(true);
          isInitializingRef.current = false;
          return true;
        } catch (error) {
          console.error('Failed to instantiate OLCesium:', error);
          isInitializingRef.current = false;
          return false;
        }
      };

      if (!tryInit()) {
        const interval = setInterval(() => {
          if (tryInit() || !enabled) {
            clearInterval(interval);
          }
        }, 300);

        return () => clearInterval(interval);
      }
    } else {
      if (ol3dRef.current) {
        try {
          ol3dRef.current.setEnabled(false);
        } catch (e) {
          console.error('Error disabling Cesium 3D:', e);
        }
      }
    }
  }, [
    map,
    enabled,
    activeBasemap,
    backgroundColor,
    enableAtmosphere,
    atmosphereSaturationShift,
    atmosphereBrightnessShift,
  ]);

  // Destroy on unmount or map destruction
  useEffect(() => {
    return () => {
      if (ol3dRef.current) {
        try {
          ol3dRef.current.setEnabled(false);
          if (typeof ol3dRef.current.destroy === 'function') {
            ol3dRef.current.destroy();
          }
        } catch {
          // ignore cleanup errors
        }
        ol3dRef.current = null;
      }
    };
  }, [map]);

  return null;
}
