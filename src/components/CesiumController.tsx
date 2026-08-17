'use client';

import { useEffect, useRef } from 'react';
import type { Map } from 'ol';

interface CesiumControllerProps {
  map: Map | null;
  enabled: boolean;
}

interface WindowWithCesium extends Window {
  Cesium?: {
    Ion?: {
      defaultAccessToken: string;
    };
    createWorldTerrainAsync?: () => Promise<unknown>;
    OpenStreetMapImageryProvider?: new (options: { url: string }) => unknown;
    UrlTemplateImageryProvider?: new (options: {
      url: string;
      subdomains?: string[] | string;
      maximumLevel?: number;
    }) => unknown;
    Color?: {
      fromCssColorString: (color: string) => unknown;
      BLACK: unknown;
      WHITE: unknown;
    };
  };
  olcs?: {
    OLCesium: new (options: { map: Map }) => {
      getCesiumScene: () => {
        canvas?: HTMLCanvasElement;
        terrainProvider: unknown;
        backgroundColor?: unknown;
        globe?: {
          enableLighting?: boolean;
          depthTestAgainstTerrain?: boolean;
          showGroundAtmosphere?: boolean;
          show?: boolean;
          baseColor?: unknown;
          atmosphereSaturationShift?: number;
          atmosphereBrightnessShift?: number;
        };
        imageryLayers?: {
          length: number;
          removeAll: (destroy?: boolean) => void;
          addImageryProvider: (provider: unknown) => void;
        };
      };
      setEnabled: (enabled: boolean) => void;
      getEnabled: () => boolean;
      destroy?: () => void;
    };
  };
}

export default function CesiumController({ map, enabled }: CesiumControllerProps) {
  const ol3dRef = useRef<{
    getCesiumScene: () => {
      canvas?: HTMLCanvasElement;
      terrainProvider: unknown;
      backgroundColor?: unknown;
      globe?: {
        enableLighting?: boolean;
        depthTestAgainstTerrain?: boolean;
        showGroundAtmosphere?: boolean;
        show?: boolean;
        baseColor?: unknown;
        atmosphereSaturationShift?: number;
        atmosphereBrightnessShift?: number;
      };
      imageryLayers?: {
        length: number;
        removeAll: (destroy?: boolean) => void;
        addImageryProvider: (provider: unknown) => void;
      };
    };
    setEnabled: (enabled: boolean) => void;
    getEnabled: () => boolean;
    destroy?: () => void;
  } | null>(null);

  const isInitializingRef = useRef(false);

  useEffect(() => {
    if (!map || typeof window === 'undefined') return;

    const win = window as unknown as WindowWithCesium;

    if (enabled) {
      if (ol3dRef.current) {
        try {
          ol3dRef.current.setEnabled(true);
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

            // Deep space background (#02040a) to create quiet negative space
            if (Cesium.Color && scene.backgroundColor !== undefined) {
              scene.backgroundColor = Cesium.Color.fromCssColorString('#02040a');
            }

            if (scene.globe) {
              scene.globe.show = true;
              scene.globe.depthTestAgainstTerrain = false;
              scene.globe.enableLighting = true; // Spherical depth & volume perception
              scene.globe.showGroundAtmosphere = true;
              // Subtle, low-saturation atmospheric rim (avoids aggressive neon sci-fi glow)
              if (scene.globe.atmosphereSaturationShift !== undefined) {
                scene.globe.atmosphereSaturationShift = -0.25;
              }
              if (scene.globe.atmosphereBrightnessShift !== undefined) {
                scene.globe.atmosphereBrightnessShift = -0.1;
              }
              if (Cesium.Color) {
                scene.globe.baseColor = Cesium.Color.fromCssColorString('#0d1b2a');
              }
            }

            // Subtle Sky Atmosphere
            const anyScene = scene as unknown as {
              skyAtmosphere?: {
                show?: boolean;
                saturationShift?: number;
                brightnessShift?: number;
              };
              moon?: { show?: boolean };
            };
            if (anyScene.skyAtmosphere) {
              anyScene.skyAtmosphere.show = true;
              anyScene.skyAtmosphere.saturationShift = -0.25;
              anyScene.skyAtmosphere.brightnessShift = -0.15;
            }
            if (anyScene.moon) {
              anyScene.moon.show = false; // Reduce background distraction
            }

            // Provide crisp, reliable Carto Voyager / OSM imagery layer on 3D globe
            if (scene.imageryLayers) {
              try {
                let provider: unknown = null;
                if (Cesium.UrlTemplateImageryProvider) {
                  provider = new Cesium.UrlTemplateImageryProvider({
                    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
                    subdomains: ['a', 'b', 'c', 'd'],
                    maximumLevel: 19,
                  });
                } else if (Cesium.OpenStreetMapImageryProvider) {
                  provider = new Cesium.OpenStreetMapImageryProvider({
                    url: 'https://tile.openstreetmap.org/',
                  });
                }

                if (provider) {
                  scene.imageryLayers.removeAll(true);
                  scene.imageryLayers.addImageryProvider(provider);
                }
              } catch (imgErr) {
                console.warn('Could not setup Cesium imagery provider:', imgErr);
              }
            }
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
  }, [map, enabled]);

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



