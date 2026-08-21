"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  UploadCloud,
  Image as ImageIcon,
  Download,
  Trash2,
  Eye,
  X,
  Loader2,
  FolderArchive,
  Lock,
  Unlock,
  Percent,
  Monitor,
  Tablet,
  Smartphone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Pin,
} from "lucide-react";


// =====================================================
// TYPES
// =====================================================

type ResizeMode =
  | "dimensions"
  | "percentage"
  | "aspect-ratio"
  | "preset";


type ResizeResult = {
  id: string;
  fileId: string;

  originalName: string;

  filename: string;
  extension: string;
  mime: string;

  size: number;

  width: number;
  height: number;

  data: string;
};


type ResizeFile = {
  id: string;

  file: File;

  originalWidth: number;
  originalHeight: number;

  previewUrl: string;

  resizeMode: ResizeMode;

  width: number;
  height: number;

  percentage: number;

  aspectWidth: number;
  aspectHeight: number;

  keepAspectRatio: boolean;

  selectedPreset: string | null;

  resizing: boolean;

  resized: boolean;
};


type Preset = {
  id: string;

  name: string;

  category:
  | "device"
  | "email"
  | "social";

  width: number;
  height: number;

  icon: any;
};


// =====================================================
// PRESETS
// =====================================================

const PRESETS: Preset[] = [

  {
    id: "desktop",
    name: "Desktop",
    category: "device",
    width: 1920,
    height: 1080,
    icon: Monitor,
  },

  {
    id: "tablet",
    name: "Tablet",
    category: "device",
    width: 1024,
    height: 768,
    icon: Tablet,
  },

  {
    id: "mobile",
    name: "Mobile",
    category: "device",
    width: 768,
    height: 1024,
    icon: Smartphone,
  },

  {
    id: "email-header",
    name: "Email Header",
    category: "email",
    width: 600,
    height: 300,
    icon: Mail,
  },

  {
    id: "email-banner",
    name: "Email Banner",
    category: "email",
    width: 1200,
    height: 600,
    icon: Mail,
  },

  {
    id: "instagram-post",
    name: "Instagram Post",
    category: "social",
    width: 1080,
    height: 1080,
    icon: Instagram,
  },

  {
    id: "instagram-story",
    name: "Instagram Story",
    category: "social",
    width: 1080,
    height: 1920,
    icon: Instagram,
  },

  {
    id: "facebook-post",
    name: "Facebook Post",
    category: "social",
    width: 1200,
    height: 630,
    icon: Facebook,
  },

  {
    id: "facebook-story",
    name: "Facebook Story",
    category: "social",
    width: 1080,
    height: 1920,
    icon: Facebook,
  },

  {
    id: "x-post",
    name: "X Post",
    category: "social",
    width: 1600,
    height: 900,
    icon: Twitter,
  },

  {
    id: "linkedin-post",
    name: "LinkedIn Post",
    category: "social",
    width: 1200,
    height: 627,
    icon: Linkedin,
  },

  {
    id: "pinterest-pin",
    name: "Pinterest Pin",
    category: "social",
    width: 1000,
    height: 1500,
    icon: Pin,
  },

];


// =====================================================
// HELPERS
// =====================================================

function getExtension(
  filename: string
): string {

  const parts =
    filename.split(".");

  return (
    parts.length > 1
      ? parts[parts.length - 1]
      : "png"
  ).toLowerCase();

}


function formatBytes(
  bytes: number
): string {

  if (!bytes) {
    return "0 KB";
  }

  return (
    bytes / 1024
  ).toFixed(2) + " KB";

}


function base64ToBlob(
  data: string,
  mime: string
): Blob {

  const binary =
    atob(data);

  const bytes =
    new Uint8Array(
      binary.length
    );

  for (
    let i = 0;
    i < binary.length;
    i++
  ) {

    bytes[i] =
      binary.charCodeAt(i);

  }

  return new Blob(
    [bytes],
    {
      type: mime,
    }
  );

}


// =====================================================
// COMPONENT
// =====================================================

export default function ImageResizerPage() {


  // ===================================================
  // STATE
  // ===================================================

  const [files, setFiles] =
    useState<ResizeFile[]>([]);

  const [results, setResults] =
    useState<ResizeResult[]>([]);

  const [dragActive, setDragActive] =
    useState(false);

  const [previewItem, setPreviewItem] =
    useState<ResizeResult | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [previewLoading, setPreviewLoading] =
    useState(false);

  const [
    zipDownloading,
    setZipDownloading,
  ] = useState(false);

  const [
    resizingAll,
    setResizingAll,
  ] = useState(false);

  const [error, setError] =
    useState<string | null>(null);


  // ===================================================
  // CLEANUP PREVIEW URL
  // ===================================================

  useEffect(() => {

    return () => {

      if (previewUrl) {

        URL.revokeObjectURL(
          previewUrl
        );

      }

    };

  }, [previewUrl]);


  // ===================================================
  // ADD FILES
  // ===================================================

  const addFiles = (
    selectedFiles:
      | FileList
      | File[]
  ) => {

    const fileArray =
      Array.from(selectedFiles);

    const imageFiles =
      fileArray.filter(
        (file) =>
          file.type.startsWith(
            "image/"
          )
      );

    if (
      imageFiles.length === 0
    ) {

      setError(
        "Please select valid image files."
      );

      return;

    }

    setError(null);


    imageFiles.forEach(
      (file) => {

        const objectUrl =
          URL.createObjectURL(
            file
          );

        const image =
          new Image();

        image.onload = () => {

          const newFile: ResizeFile = {

            id:
              `${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 9)}`,

            file,

            originalWidth:
              image.width,

            originalHeight:
              image.height,

            previewUrl:
              objectUrl,

            resizeMode:
              "dimensions",

            width:
              image.width,

            height:
              image.height,

            percentage:
              50,

            aspectWidth:
              16,

            aspectHeight:
              9,

            keepAspectRatio:
              true,

            selectedPreset:
              null,

            resizing:
              false,

            resized:
              false,

          };

          setFiles(
            (previous) => [
              ...previous,
              newFile,
            ]
          );

        };


        image.onerror = () => {

          URL.revokeObjectURL(
            objectUrl
          );

        };


        image.src =
          objectUrl;

      }
    );

  };


  // ===================================================
  // FILE INPUT
  // ===================================================

  const handleFileChange = (
    event:
      ChangeEvent<HTMLInputElement>
  ) => {

    if (
      event.target.files
    ) {

      addFiles(
        event.target.files
      );

    }

    event.target.value =
      "";

  };


  // ===================================================
  // DRAG EVENTS
  // ===================================================

  const handleDragOver = (
    event:
      DragEvent<HTMLDivElement>
  ) => {

    event.preventDefault();

    setDragActive(true);

  };


  const handleDragLeave = (
    event:
      DragEvent<HTMLDivElement>
  ) => {

    event.preventDefault();

    setDragActive(false);

  };


  const handleDrop = (
    event:
      DragEvent<HTMLDivElement>
  ) => {

    event.preventDefault();

    setDragActive(false);

    if (
      event.dataTransfer.files
    ) {

      addFiles(
        event.dataTransfer.files
      );

    }

  };


  // ===================================================
  // REMOVE FILE
  // ===================================================

  const removeFile = (
    id: string
  ) => {

    setFiles(
      (previous) => {

        const target =
          previous.find(
            (item) =>
              item.id === id
          );

        if (
          target?.previewUrl
        ) {

          URL.revokeObjectURL(
            target.previewUrl
          );

        }

        return previous.filter(
          (item) =>
            item.id !== id
        );

      }
    );


    setResults(
      (previous) =>
        previous.filter(
          (item) =>
            item.fileId !== id
        )
    );

  };


  // ===================================================
  // CLEAR ALL
  // ===================================================

  const clearAll = () => {

    files.forEach(
      (item) => {

        if (
          item.previewUrl
        ) {

          URL.revokeObjectURL(
            item.previewUrl
          );

        }

      }
    );

    setFiles([]);

    setResults([]);

    setError(null);

  };


  // ===================================================
  // UPDATE FILE
  // ===================================================

  const updateFile = (
    id: string,
    updates:
      Partial<ResizeFile>
  ) => {

    setFiles(
      (previous) =>
        previous.map(
          (item) =>
            item.id === id
              ? {
                ...item,
                ...updates,
              }
              : item
        )
    );

  };


  // ===================================================
  // WIDTH
  // ===================================================

  const handleWidthChange = (
    id: string,
    value: number
  ) => {

    const item =
      files.find(
        (file) =>
          file.id === id
      );

    if (!item) {
      return;
    }

    let newHeight =
      item.height;

    if (
      item.keepAspectRatio &&
      value > 0 &&
      item.originalWidth > 0
    ) {

      const ratio =
        item.originalHeight /
        item.originalWidth;

      newHeight =
        Math.round(
          value * ratio
        );

    }

    updateFile(
      id,
      {
        width: value,
        height: newHeight,
        resized: false,
      }
    );

  };


  // ===================================================
  // HEIGHT
  // ===================================================

  const handleHeightChange = (
    id: string,
    value: number
  ) => {

    const item =
      files.find(
        (file) =>
          file.id === id
      );

    if (!item) {
      return;
    }

    let newWidth =
      item.width;

    if (
      item.keepAspectRatio &&
      value > 0 &&
      item.originalHeight > 0
    ) {

      const ratio =
        item.originalWidth /
        item.originalHeight;

      newWidth =
        Math.round(
          value * ratio
        );

    }

    updateFile(
      id,
      {
        width: newWidth,
        height: value,
        resized: false,
      }
    );

  };


  // ===================================================
  // ASPECT RATIO
  // ===================================================

  const applyAspectRatio = (
    id: string
  ) => {

    const item =
      files.find(
        (file) =>
          file.id === id
      );

    if (!item) {
      return;
    }

    if (
      item.aspectWidth <= 0 ||
      item.aspectHeight <= 0
    ) {
      return;
    }

    const newWidth =
      item.width ||
      item.originalWidth;

    const newHeight =
      Math.round(
        newWidth *
        (
          item.aspectHeight /
          item.aspectWidth
        )
      );

    updateFile(
      id,
      {
        width:
          newWidth,

        height:
          newHeight,

        resized:
          false,
      }
    );

  };


  // ===================================================
  // PRESET
  // ===================================================

  const applyPreset = (
    id: string,
    preset: Preset
  ) => {

    updateFile(
      id,
      {
        resizeMode:
          "preset",

        selectedPreset:
          preset.id,

        width:
          preset.width,

        height:
          preset.height,

        keepAspectRatio:
          false,

        resized:
          false,
      }
    );

  };


  // ===================================================
  // RESIZE SINGLE IMAGE
  // ===================================================

  const resizeSingleImage = async (
    item: ResizeFile
  ) => {

    try {

      setError(null);

      updateFile(
        item.id,
        {
          resizing: true,
        }
      );


      let targetWidth =
        item.width;

      let targetHeight =
        item.height;


      // PERCENTAGE

      if (
        item.resizeMode ===
        "percentage"
      ) {

        const factor =
          item.percentage /
          100;

        targetWidth =
          Math.round(
            item.originalWidth *
            factor
          );

        targetHeight =
          Math.round(
            item.originalHeight *
            factor
          );

      }


      // ASPECT RATIO

      if (
        item.resizeMode ===
        "aspect-ratio"
      ) {

        if (
          item.aspectWidth <= 0 ||
          item.aspectHeight <= 0
        ) {

          throw new Error(
            "Invalid aspect ratio."
          );

        }

        targetWidth =
          item.width;

        targetHeight =
          Math.round(
            targetWidth *
            (
              item.aspectHeight /
              item.aspectWidth
            )
          );

      }


      // PRESET

      if (
        item.resizeMode ===
        "preset"
      ) {

        const preset =
          PRESETS.find(
            (presetItem) =>
              presetItem.id ===
              item.selectedPreset
          );

        if (!preset) {

          throw new Error(
            "Please select a resize preset."
          );

        }

        targetWidth =
          preset.width;

        targetHeight =
          preset.height;

      }


      // VALIDATE

      if (
        targetWidth <= 0 ||
        targetHeight <= 0
      ) {

        throw new Error(
          "Width and height must be greater than 0."
        );

      }


      // FILE TO BASE64

      const arrayBuffer =
        await item.file.arrayBuffer();

      const bytes =
        new Uint8Array(
          arrayBuffer
        );

      let binary =
        "";

      const chunkSize =
        0x8000;

      for (
        let i = 0;
        i < bytes.length;
        i += chunkSize
      ) {

        binary +=
          String.fromCharCode(
            ...bytes.subarray(
              i,
              Math.min(
                i + chunkSize,
                bytes.length
              )
            )
          );

      }

      const base64 =
        btoa(binary);


      // DETERMINE MODE

      const resizeMode =
        item.resizeMode ===
          "dimensions"
          ? (
            item.keepAspectRatio
              ? "fit"
              : "stretch"
          )
          : item.resizeMode ===
            "preset"
            ? "stretch"
            : "fit";


      // API

      const response =
        await fetch(
          "/api/image-resizer/resize",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                data:
                  base64,

                filename:
                  item.file.name,

                width:
                  targetWidth,

                height:
                  targetHeight,

                mode:
                  resizeMode,
              }),
          }
        );

      const responseData =
        await response.json();

      if (
        !response.ok ||
        !responseData.success
      ) {

        throw new Error(
          responseData.message ||
          "Image resize failed."
        );

      }


      const newResult: ResizeResult = {

        id:
          `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`,

        fileId:
          item.id,

        originalName:
          item.file.name,

        filename:
          responseData.filename,

        extension:
          responseData.extension ||
          getExtension(
            responseData.filename
          ),

        mime:
          responseData.mime ||
          "image/png",

        size:
          responseData.size,

        width:
          responseData.width ||
          targetWidth,

        height:
          responseData.height ||
          targetHeight,

        data:
          responseData.data,

      };


      setResults(
        (previous) => [

          ...previous.filter(
            (result) =>
              result.fileId !==
              item.id
          ),

          newResult,

        ]
      );


      updateFile(
        item.id,
        {
          resizing:
            false,

          resized:
            true,
        }
      );

    } catch (
    error: any
    ) {

      console.error(
        "Resize error:",
        error
      );

      setError(
        error?.message ||
        "Image resize failed."
      );

      updateFile(
        item.id,
        {
          resizing:
            false,
        }
      );

    }

  };


  // ===================================================
  // RESIZE ALL
  // ===================================================

  const resizeAllImages =
    async () => {

      if (
        files.length === 0
      ) {

        setError(
          "Please upload at least one image."
        );

        return;

      }

      setError(null);

      setResizingAll(
        true
      );

      try {

        for (
          const item of files
        ) {

          await resizeSingleImage(
            item
          );

        }

      } finally {

        setResizingAll(
          false
        );

      }

    };


  // ===================================================
  // GET RESULT
  // ===================================================

  const getResultForFile = (
    fileId: string
  ) => {

    return results.find(
      (result) =>
        result.fileId ===
        fileId
    );

  };


  // ===================================================
  // PREVIEW
  // ===================================================

  const openPreview = async (
    item: ResizeResult
  ) => {

    try {

      setPreviewItem(
        item
      );

      setPreviewLoading(
        true
      );

      if (
        previewUrl
      ) {

        URL.revokeObjectURL(
          previewUrl
        );

      }

      setPreviewUrl(
        null
      );

      const blob =
        base64ToBlob(
          item.data,
          item.mime ||
          "image/png"
        );

      const url =
        URL.createObjectURL(
          blob
        );

      setPreviewUrl(
        url
      );

    } catch (
    error
    ) {

      console.error(
        "Preview error:",
        error
      );

      setPreviewUrl(
        null
      );

    } finally {

      setPreviewLoading(
        false
      );

    }

  };


  // ===================================================
  // CLOSE PREVIEW
  // ===================================================

  const closePreview = () => {

    if (
      previewUrl
    ) {

      URL.revokeObjectURL(
        previewUrl
      );

    }

    setPreviewUrl(
      null
    );

    setPreviewItem(
      null
    );

    setPreviewLoading(
      false
    );

  };


  // ===================================================
  // DOWNLOAD IMAGE
  // ===================================================

  const downloadImage = (
    item: ResizeResult
  ) => {

    try {

      const blob =
        base64ToBlob(
          item.data,
          item.mime ||
          "image/png"
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href =
        url;

      link.download =
        item.filename;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      setTimeout(() => {

        URL.revokeObjectURL(
          url
        );

      }, 1000);

    } catch (
    error
    ) {

      console.error(
        "Download error:",
        error
      );

    }

  };


  // ===================================================
  // DOWNLOAD ZIP
  // ===================================================

  const downloadZip =
    async () => {

      const resizedFiles =
        results.filter(
          (file) =>
            file.data &&
            file.filename
        );

      if (
        resizedFiles.length === 0
      ) {

        alert(
          "Please resize at least one image first."
        );

        return;

      }


      if (
        resizedFiles.length === 1
      ) {

        downloadImage(
          resizedFiles[0]
        );

        return;

      }

      try {

        setZipDownloading(
          true
        );

        const zipFiles =
          resizedFiles.map(
            (file) => ({
              filename:
                file.filename,

              data:
                file.data,

              mime:
                file.mime ||
                "image/png",
            })
          );

        const response =
          await fetch(
            "/api/image-resizer/download-zip",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  files:
                    zipFiles,
                }),
            }
          );

        if (
          !response.ok
        ) {

          throw new Error(
            "ZIP download failed."
          );

        }

        const blob =
          await response.blob();

        const url =
          URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href =
          url;

        link.download =
          "resized-images.zip";

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();

        setTimeout(() => {

          URL.revokeObjectURL(
            url
          );

        }, 1000);

      } catch (
      error
      ) {

        console.error(
          "ZIP download failed:",
          error
        );

      } finally {

        setZipDownloading(
          false
        );

      }

    };


  // ===================================================
  // RENDER
  // ===================================================

  return (
    <>

      <Header />

      <main className="min-h-screen bg-white px-4 py-10 text-ink dark:bg-slate-950 dark:text-white sm:px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/15 via-secondary/10 to-transparent blur-3xl"

        />

        <div className="mx-auto w-full max-w-6xl">


          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-10 text-center">

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="text-balance text-hero-sm text-ink dark:text-ink-dark md:text-hero"
            >
              Resize{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Images
              </span>
            </motion.h1>

            {/*<p className="mx-auto mt-4 max-w-2xl text-lg text-muted dark:text-slate-400">
              Resize your images by dimensions, percentage,
              aspect ratio or ready-to-use presets.
            </p>*/}

          </div>


          {/* =================================================
              UPLOAD AREA
          ================================================= */}

          <div
            onDragOver={
              handleDragOver
            }
            onDragLeave={
              handleDragLeave
            }
            onDrop={
              handleDrop
            }
            className={[
              "rounded-3xl border-2 border-dashed p-10 text-center transition-all",
              dragActive
                ? "border-primary bg-primary/5"
                : "border-slate-300 bg-white hover:border-primary dark:border-slate-700 dark:bg-slate-900",
            ].join(" ")}
          >

            <div className="mx-auto flex max-w-xl flex-col items-center">

              {/* UPLOAD ICON */}

              <div className="relative mb-6 flex h-20 w-28 items-center justify-center">

                <motion.div
                  aria-hidden
                  className="absolute h-14 w-24 origin-center rounded-xl2 bg-gradient-to-br from-primary to-secondary shadow-lift"
                  animate={{
                    scaleX: [1, 0.82, 1],
                  }}
                  transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <motion.div
                  initial={{
                    y: -6,
                    opacity: 0,
                  }}
                  animate={{
                    y: [0, -6, 0],
                    opacity: 1,
                  }}
                  transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative z-10"
                >
                  <UploadCloud
                    className="h-8 w-8 text-white"
                    strokeWidth={2.2}
                  />
                </motion.div>

              </div>

              <h3 className="text-xl font-bold text-ink dark:text-ink-dark">
                Drop your images here
              </h3>

              <p className="mt-1.5 text-sm text-muted dark:text-muted-dark">
                or click below to browse from your device
              </p>


              <label className="mt-8 cursor-pointer">

                <span className="btn-ripple mt-6 cursor-pointer rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-lift">
                  Choose Images
                </span>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={
                    handleFileChange
                  }
                />

              </label>

            </div>

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30">
              {error}
            </div>

          )}


          {/* =================================================
              FILES
          ================================================= */}

          {files.length > 0 && (

            <div className="mt-8">


              {/* HEADER */}

              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h2 className="text-xl font-bold">
                    Your Images
                  </h2>

                  <p className="mt-1 text-sm text-muted dark:text-slate-400">

                    {files.length}{" "}

                    {files.length === 1
                      ? "image"
                      : "images"}{" "}

                    selected

                  </p>

                </div>


                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    onClick={
                      resizeAllImages
                    }
                    disabled={
                      resizingAll ||
                      files.length === 0
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {resizingAll ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Resizing All...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-4 w-4" />
                        Resize All
                      </>
                    )}

                  </button>


                  <button
                    type="button"
                    onClick={
                      clearAll
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30"
                  >

                    <Trash2 className="h-4 w-4" />

                    Clear All

                  </button>

                </div>

              </div>


              {/* =================================================
                  COMPACT IMAGE CARDS
              ================================================= */}

              <div className="space-y-3">

                {files.map(
                  (item) => {

                    const result =
                      getResultForFile(
                        item.id
                      );

                    return (

                      <motion.div
                        key={
                          item.id
                        }
                        initial={{
                          opacity: 0,
                          y: 8,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          duration: 0.2,
                        }}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-primary/30 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                      >

                        <div className="flex min-h-[104px] flex-col lg:flex-row">


                          {/* =============================================
                              THUMBNAIL
                          ============================================= */}

                          <div
                            className="group relative h-[104px] w-full shrink-0 cursor-pointer overflow-hidden bg-slate-100 sm:w-[104px] dark:bg-slate-950"
                            onClick={() => {

                              if (result) {

                                openPreview(
                                  result
                                );

                              }

                            }}
                          >

                            <img
                              src={
                                item.previewUrl
                              }
                              alt={
                                item.file.name
                              }
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />


                            {/* OVERLAY */}

                            <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/30" />


                            {/* EYE */}

                            {result && (

                              <div className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-800 opacity-0 shadow-lg transition group-hover:opacity-100">

                                <Eye className="h-4 w-4" />

                              </div>

                            )}


                            {/* FORMAT */}

                            <div className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">

                              {getExtension(
                                item.file.name
                              )}

                            </div>

                          </div>


                          {/* =============================================
                              CONTENT
                          ============================================= */}

                          <div className="flex min-w-0 flex-1 flex-col">


                            {/* MAIN ROW */}

                            <div className="flex flex-1 flex-col justify-center gap-4 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">


                              {/* FILE INFO */}

                              <div className="min-w-0 flex-1">

                                <p
                                  className="truncate text-sm font-semibold"
                                  title={
                                    item.file.name
                                  }
                                >

                                  {item.file.name}

                                </p>

                                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted dark:text-slate-400">

                                  <span>

                                    {item.originalWidth}
                                    {" × "}
                                    {item.originalHeight}

                                  </span>

                                  <span className="text-slate-300">
                                    •
                                  </span>

                                  <span>

                                    {formatBytes(
                                      item.file.size
                                    )}

                                  </span>


                                  {result && (
                                    <>
                                      <span className="text-slate-300">
                                        →
                                      </span>

                                      <span className="font-medium text-green-600">

                                        {result.width}
                                        {" × "}
                                        {result.height}

                                      </span>
                                    </>
                                  )}

                                </div>


                                {result && (

                                  <p
                                    className="mt-1 truncate text-[11px] text-green-600 dark:text-green-400"
                                    title={
                                      result.filename
                                    }
                                  >

                                    {result.filename}

                                  </p>

                                )}

                              </div>


                              {/* =========================================
                                  RESIZE BUTTON
                              ========================================= */}

                              <button
                                type="button"
                                disabled={
                                  item.resizing ||
                                  resizingAll
                                }
                                onClick={() =>
                                  resizeSingleImage(
                                    item
                                  )
                                }
                                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
                              >

                                {item.resizing ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />

                                    Resizing

                                  </>
                                ) : (
                                  <>
                                    <ImageIcon className="h-3.5 w-3.5" />

                                    {result
                                      ? "Resize Again"
                                      : "Resize"}

                                  </>
                                )}

                              </button>

                            </div>


                            {/* =========================================
                                RESIZE CONTROLS
                            ========================================= */}

                            <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-800">


                              {/* MODE */}

                              <div className="mb-3 flex flex-wrap gap-2">

                                {[
                                  "dimensions",
                                  "percentage",
                                  "aspect-ratio",
                                  "preset",
                                ].map(
                                  (mode) => (

                                    <button
                                      key={
                                        mode
                                      }
                                      type="button"
                                      onClick={() =>
                                        updateFile(
                                          item.id,
                                          {
                                            resizeMode:
                                              mode as ResizeMode,

                                            resized:
                                              false,
                                          }
                                        )
                                      }
                                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${item.resizeMode ===
                                        mode
                                        ? "bg-primary text-white"
                                        : "border border-slate-200 text-muted hover:border-primary/40 dark:border-slate-700 dark:text-slate-400"
                                        }`}
                                    >

                                      {mode ===
                                        "dimensions"
                                        ? "Dimensions"
                                        : mode ===
                                          "percentage"
                                          ? "Percentage"
                                          : mode ===
                                            "aspect-ratio"
                                            ? "Aspect Ratio"
                                            : "Preset"}

                                    </button>

                                  )
                                )}

                              </div>


                              {/* DIMENSIONS */}

                              {item.resizeMode ===
                                "dimensions" && (

                                  <div className="flex flex-wrap items-center gap-3">

                                    <input
                                      type="number"
                                      value={
                                        item.width
                                      }
                                      onChange={(event) =>
                                        handleWidthChange(
                                          item.id,
                                          Number(
                                            event.target.value
                                          )
                                        )
                                      }
                                      className="h-9 w-28 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-950"
                                    />

                                    <span className="text-sm text-muted">
                                      ×
                                    </span>

                                    <input
                                      type="number"
                                      value={
                                        item.height
                                      }
                                      onChange={(event) =>
                                        handleHeightChange(
                                          item.id,
                                          Number(
                                            event.target.value
                                          )
                                        )
                                      }
                                      className="h-9 w-28 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-950"
                                    />

                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateFile(
                                          item.id,
                                          {
                                            keepAspectRatio:
                                              !item.keepAspectRatio,
                                            resized:
                                              false,
                                          }
                                        )
                                      }
                                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700"
                                      title="Toggle aspect ratio"
                                    >

                                      {item.keepAspectRatio ? (
                                        <Lock className="h-4 w-4 text-primary" />
                                      ) : (
                                        <Unlock className="h-4 w-4 text-muted" />
                                      )}

                                    </button>

                                  </div>

                                )}


                              {/* PERCENTAGE */}

                              {item.resizeMode ===
                                "percentage" && (

                                  <div className="flex items-center gap-3">

                                    <div className="relative">

                                      <input
                                        type="number"
                                        min="1"
                                        value={
                                          item.percentage
                                        }
                                        onChange={(event) =>
                                          updateFile(
                                            item.id,
                                            {
                                              percentage:
                                                Number(
                                                  event.target.value
                                                ),

                                              resized:
                                                false,
                                            }
                                          )
                                        }
                                        className="h-9 w-28 rounded-lg border border-slate-200 px-3 pr-8 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-950"
                                      />

                                      <Percent className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />

                                    </div>

                                    <span className="text-xs text-muted">
                                      Resize from original dimensions
                                    </span>

                                  </div>

                                )}


                              {/* ASPECT RATIO */}

                              {item.resizeMode ===
                                "aspect-ratio" && (

                                  <div className="flex flex-wrap items-center gap-3">

                                    <input
                                      type="number"
                                      value={
                                        item.aspectWidth
                                      }
                                      onChange={(event) =>
                                        updateFile(
                                          item.id,
                                          {
                                            aspectWidth:
                                              Number(
                                                event.target.value
                                              ),

                                            resized:
                                              false,
                                          }
                                        )
                                      }
                                      className="h-9 w-24 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-950"
                                    />

                                    <span className="text-sm text-muted">
                                      :
                                    </span>

                                    <input
                                      type="number"
                                      value={
                                        item.aspectHeight
                                      }
                                      onChange={(event) =>
                                        updateFile(
                                          item.id,
                                          {
                                            aspectHeight:
                                              Number(
                                                event.target.value
                                              ),

                                            resized:
                                              false,
                                          }
                                        )
                                      }
                                      className="h-9 w-24 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-950"
                                    />

                                    <button
                                      type="button"
                                      onClick={() =>
                                        applyAspectRatio(
                                          item.id
                                        )
                                      }
                                      className="rounded-lg border border-primary px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/5"
                                    >

                                      Apply Ratio

                                    </button>

                                  </div>

                                )}


                              {/* PRESETS */}

                              {item.resizeMode ===
                                "preset" && (

                                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">

                                    {PRESETS.map(
                                      (preset) => {

                                        const Icon =
                                          preset.icon;

                                        return (

                                          <button
                                            key={
                                              preset.id
                                            }
                                            type="button"
                                            onClick={() =>
                                              applyPreset(
                                                item.id,
                                                preset
                                              )
                                            }
                                            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition ${item.selectedPreset ===
                                              preset.id
                                              ? "border-primary bg-primary/10"
                                              : "border-slate-200 hover:border-primary/40 dark:border-slate-700"
                                              }`}
                                          >

                                            <Icon className="h-4 w-4 text-primary" />

                                            <div>

                                              <div className="text-xs font-semibold">

                                                {preset.name}

                                              </div>

                                              <div className="text-[10px] text-muted">

                                                {preset.width}
                                                {" × "}
                                                {preset.height}

                                              </div>

                                            </div>

                                          </button>

                                        );

                                      }
                                    )}

                                  </div>

                                )}

                            </div>


                            {/* =========================================
                                STATUS
                            ========================================= */}

                            {item.resizing && (

                              <div className="flex items-center gap-2 border-t border-blue-100 bg-blue-50/60 px-4 py-2 dark:border-blue-900/40 dark:bg-blue-950/20">

                                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />

                                <span className="text-xs font-medium text-primary">

                                  Resizing image...

                                </span>

                              </div>

                            )}


                            {result && !item.resizing && (

                              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2 dark:border-slate-800 dark:bg-slate-950/50">

                                <div className="flex items-center gap-2">

                                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-100 text-[10px] font-bold text-green-600">
                                    ✓
                                  </span>

                                  <span className="text-xs font-semibold text-green-600">

                                    Resize complete

                                  </span>

                                </div>

                                <span className="text-[11px] text-muted">

                                  {formatBytes(
                                    result.size
                                  )}

                                </span>

                              </div>

                            )}

                          </div>


                          {/* =============================================
                              DOWNLOAD
                          ============================================= */}

                          <div className="flex min-w-[76px] shrink-0 items-center justify-center border-t border-slate-100 px-3 py-3 lg:border-l lg:border-t-0 dark:border-slate-800">

                            <button
                              type="button"
                              disabled={
                                !result
                              }
                              onClick={() => {

                                if (result) {

                                  downloadImage(
                                    result
                                  );

                                }

                              }}
                              className="flex min-w-[58px] flex-col items-center justify-center rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-2 text-primary transition hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
                            >

                              <Download className="mb-0.5 h-3.5 w-3.5" />

                              <span className="text-[9px] font-bold uppercase">

                                {result
                                  ? result.extension
                                  : getExtension(
                                    item.file.name
                                  )}

                              </span>

                            </button>

                          </div>


                          {/* =============================================
                              REMOVE
                          ============================================= */}

                          <div className="flex w-11 shrink-0 items-center justify-center border-l border-slate-100 dark:border-slate-800">

                            <button
                              type="button"
                              onClick={() =>
                                removeFile(
                                  item.id
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                              title="Remove image"
                            >

                              <X className="h-4 w-4" />

                            </button>

                          </div>

                        </div>

                      </motion.div>

                    );

                  }
                )}

              </div>


              {/* =================================================
                  BOTTOM ACTIONS
              ================================================= */}

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">


                <button
                  type="button"
                  onClick={
                    resizeAllImages
                  }
                  disabled={
                    resizingAll ||
                    files.length === 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 font-semibold text-white shadow-sm transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {resizingAll ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />

                      Resizing All...

                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-5 w-5" />

                      Resize All Images

                    </>
                  )}

                </button>


                <button
                  type="button"
                  onClick={
                    downloadZip
                  }
                  disabled={
                    results.length === 0 ||
                    zipDownloading
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary bg-primary/5 px-7 py-3.5 font-semibold text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {zipDownloading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />

                      Creating ZIP...

                    </>
                  ) : (
                    <>
                      <FolderArchive className="h-5 w-5" />

                      {results.length === 1
                        ? "Download Image"
                        : "Download All as ZIP"}

                    </>
                  )}

                </button>

              </div>

            </div>

          )}

        </div>


        {/* =================================================
            PREVIEW MODAL
        ================================================= */}

        {previewItem && (

          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={
              closePreview
            }
          >

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 10,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              transition={{
                duration: 0.2,
              }}
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
              className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
            >


              {/* HEADER */}

              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">

                <div className="min-w-0">

                  <h3 className="truncate font-semibold">

                    {previewItem.filename}

                  </h3>

                  <p className="mt-1 text-xs text-muted dark:text-slate-400">

                    {formatBytes(
                      previewItem.size
                    )}

                    {" · "}

                    {previewItem.extension.toUpperCase()}

                    {" · "}

                    {previewItem.width}

                    {" × "}

                    {previewItem.height}

                    {" px"}

                  </p>

                </div>


                <button
                  type="button"
                  onClick={
                    closePreview
                  }
                  className="rounded-full p-2 text-muted transition hover:bg-slate-100 hover:text-ink dark:hover:bg-slate-800"
                >

                  <X className="h-5 w-5" />

                </button>

              </div>


              {/* IMAGE */}

              <div className="flex min-h-[300px] flex-1 items-center justify-center overflow-auto bg-slate-100 p-6 dark:bg-slate-950">

                {previewLoading ? (

                  <div className="flex items-center gap-2 text-sm text-muted">

                    <Loader2 className="h-5 w-5 animate-spin" />

                    Loading preview...

                  </div>

                ) : previewUrl ? (

                  <img
                    src={
                      previewUrl
                    }
                    alt={
                      previewItem.filename
                    }
                    className="max-h-[65vh] max-w-full rounded-lg object-contain shadow-lg"
                  />

                ) : null}

              </div>


              {/* FOOTER */}

              <div className="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row dark:border-slate-800">

                <button
                  type="button"
                  onClick={
                    closePreview
                  }
                  className="flex-1 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold transition hover:border-primary hover:text-primary dark:border-slate-700"
                >

                  Close

                </button>


                <button
                  type="button"
                  onClick={() => {

                    downloadImage(
                      previewItem
                    );

                    closePreview();

                  }}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600"
                >

                  <Download className="h-4 w-4" />

                  Download

                </button>

              </div>

            </motion.div>

          </div>

        )}

      </main>

      <Footer />

    </>
  );
}