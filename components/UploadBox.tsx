"use client";

import {
  ChangeEvent,
  DragEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  UploadCloud,
  Images,
  Layers3,
  FolderArchive,
  ShieldCheck,
  Infinity as InfinityIcon,
  X,
  Eye,
  Download,
  Loader2,
} from "lucide-react";

/* =====================================================
   PILLS
===================================================== */

const PILLS = [
  {
    icon: UploadCloud,
    label: "Drag & Drop",
  },
  {
    icon: InfinityIcon,
    label: "Unlimited Images",
  },
  {
    icon: Layers3,
    label: "Batch Upload",
  },
  {
    icon: FolderArchive,
    label: "ZIP Download",
  },
  {
    icon: Images,
    label: "JPG · PNG · WEBP · AVIF · SVG",
  },
  {
    icon: ShieldCheck,
    label: "Secure Processing",
  },
];

/* =====================================================
   FORMAT OPTIONS
===================================================== */

const FORMAT_OPTIONS = [
  {
    value: "jpg",
    label: "JPG",
  },
  {
    value: "png",
    label: "PNG",
  },
  {
    value: "webp",
    label: "WEBP",
  },
  {
    value: "avif",
    label: "AVIF",
  },
  {
    value: "svg",
    label: "SVG",
  },
];

/* =====================================================
   TYPES
===================================================== */

interface ImageResult {
  originalName: string;

  compressedName: string;

  currentExtension: string;

  mime: string;

  originalMime: string;

  originalSize: number;

  compressedSize: number;

  saved: string;

  data: string;

  originalData?: string;

  convertedData?: string;

  convertedMime?: string;

  convertedSize?: number;

  convertedName?: string;

  convertedExtension?: string;
}

/* =====================================================
   COMPONENT
===================================================== */

export default function UploadBox() {
  /* ===================================================
     STATE
  =================================================== */

  const [dragging, setDragging] = useState(false);

  const [fileNames, setFileNames] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  const [results, setResults] = useState<ImageResult[]>([]);

  const [downloadFormats, setDownloadFormats] =
    useState<Record<string, string>>({});

  const [converting, setConverting] =
    useState<Record<string, boolean>>({});

  const [previewItem, setPreviewItem] =
    useState<ImageResult | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [previewLoading, setPreviewLoading] =
    useState(false);

  /* ===================================================
     CLEANUP PREVIEW URL
  =================================================== */

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /* =====================================================
     BASE64 → BLOB
  ===================================================== */

  const base64ToBlob = (
    base64: string,
    mime: string
  ) => {
    const binary = atob(base64);

    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return new Blob([bytes], {
      type: mime,
    });
  };

  /* =====================================================
     MIME FROM EXTENSION
  ===================================================== */

  const getMimeFromExtension = (
    extension: string
  ) => {
    switch (extension.toLowerCase()) {
      case "jpg":
      case "jpeg":
        return "image/jpeg";

      case "png":
        return "image/png";

      case "webp":
        return "image/webp";

      case "avif":
        return "image/avif";

      case "svg":
        return "image/svg+xml";

      default:
        return "application/octet-stream";
    }
  };

  /* =====================================================
     ORIGINAL EXTENSION
  ===================================================== */

  const getOriginalExtension = (
    item: ImageResult
  ) => {
    if (item.originalName) {
      const extension = item.originalName
        .split(".")
        .pop()
        ?.toLowerCase();

      if (extension) {
        if (extension === "jpeg") {
          return "jpg";
        }

        return extension;
      }
    }

    const mime = String(
      item.originalMime || ""
    ).toLowerCase();

    if (mime === "image/png") {
      return "png";
    }

    if (
      mime === "image/jpeg" ||
      mime === "image/jpg"
    ) {
      return "jpg";
    }

    if (mime === "image/webp") {
      return "webp";
    }

    if (mime === "image/avif") {
      return "avif";
    }

    if (mime === "image/svg+xml") {
      return "svg";
    }

    return item.currentExtension;
  };

  /* =====================================================
     COMPRESS IMAGES
  ===================================================== */

  const compressImages = async (
    files: File[]
  ) => {
    try {
      setLoading(true);

      setResults([]);

      setDownloadFormats({});

      setPreviewItem(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(null);

      const formData = new FormData();

      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(
        "/api/compress",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Compression failed"
        );
      }

      const compressedResults: ImageResult[] =
        data.files;

      setResults(compressedResults);

      const formats: Record<
        string,
        string
      > = {};

      compressedResults.forEach(
        (file) => {
          formats[
            file.compressedName
          ] = file.currentExtension;
        }
      );

      setDownloadFormats(formats);
    } catch (error) {
      console.error(error);

      alert(
        "Failed to compress image."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     CONVERT IMAGE
  ===================================================== */

  const convertForFormat = async (
    item: ImageResult,
    targetFormat: string
  ) => {
    const key = item.compressedName;

    const currentFormat = String(
      item.currentExtension
    ).toLowerCase();

    const target = String(
      targetFormat
    ).toLowerCase();

    /* ===================================================
       SAME FORMAT
    =================================================== */

    const sameFormat =
      currentFormat === target ||
      (currentFormat === "jpeg" &&
        target === "jpg") ||
      (currentFormat === "jpg" &&
        target === "jpeg");

    if (sameFormat) {
      setResults((previous) =>
        previous.map((result) => {
          if (
            result.compressedName !==
            key
          ) {
            return result;
          }

          return {
            ...result,

            convertedData:
              result.data,

            convertedMime:
              result.mime,

            convertedSize:
              result.compressedSize,

            convertedName:
              result.compressedName,

            convertedExtension:
              result.currentExtension,
          };
        })
      );

      return;
    }

    try {
      setConverting((previous) => ({
        ...previous,
        [key]: true,
      }));

      setPreviewLoading(true);

      /* =================================================
         SVG USES ORIGINAL
      ================================================= */

      const conversionData =
        target === "svg" &&
          item.originalData
          ? item.originalData
          : item.data;

      const conversionFilename =
        target === "svg"
          ? item.originalName
          : item.compressedName;

      const currentExtension =
        target === "svg"
          ? getOriginalExtension(item)
          : item.currentExtension;

      console.log(
        "========================================"
      );

      console.log(
        "Frontend conversion"
      );

      console.log(
        `${currentExtension} → ${target}`
      );

      console.log(
        "Conversion source:",
        target === "svg"
          ? "ORIGINAL IMAGE"
          : "COMPRESSED IMAGE"
      );

      /* =================================================
         API
      ================================================= */

      const response = await fetch(
        "/api/convert",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            data: conversionData,

            filename:
              conversionFilename,

            format: target,

            currentExtension,

            originalMime:
              item.originalMime ||
              item.mime,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
          "Conversion failed"
        );
      }

      /* =================================================
         UPDATE RESULT
      ================================================= */

      setResults((previous) =>
        previous.map((file) => {
          if (
            file.compressedName !==
            key
          ) {
            return file;
          }

          return {
            ...file,

            convertedData:
              result.data,

            convertedMime:
              result.mime,

            convertedSize:
              result.size,

            convertedName:
              result.filename,

            convertedExtension:
              result.extension,
          };
        })
      );
    } catch (error: any) {
      console.error(
        "Conversion error:",
        error
      );

      alert(
        error.message ||
        "Conversion failed."
      );

      setDownloadFormats(
        (previous) => ({
          ...previous,
          [key]:
            item.currentExtension,
        })
      );
    } finally {
      setConverting((previous) => ({
        ...previous,
        [key]: false,
      }));

      setPreviewLoading(false);
    }
  };

  /* =====================================================
     FORMAT CHANGE
  ===================================================== */

  const handleFormatChange = async (
    item: ImageResult,
    format: string
  ) => {
    const key = item.compressedName;

    setDownloadFormats((previous) => ({
      ...previous,
      [key]: format,
    }));

    await convertForFormat(
      item,
      format
    );
  };

  /* =====================================================
     GET ACTIVE FILE
  ===================================================== */

  const getActiveFile = (
    item: ImageResult
  ) => {
    const selectedFormat =
      downloadFormats[
      item.compressedName
      ] ?? item.currentExtension;

    const currentFormat =
      item.currentExtension;

    const sameFormat =
      selectedFormat ===
      currentFormat ||
      (selectedFormat === "jpg" &&
        currentFormat ===
        "jpeg") ||
      (selectedFormat === "jpeg" &&
        currentFormat === "jpg");

    if (sameFormat) {
      return {
        data: item.data,

        mime:
          item.mime ||
          getMimeFromExtension(
            currentFormat
          ),

        size: item.compressedSize,

        filename:
          item.compressedName,
      };
    }

    if (item.convertedData) {
      return {
        data: item.convertedData,

        mime:
          item.convertedMime ||
          getMimeFromExtension(
            selectedFormat
          ),

        size:
          item.convertedSize || 0,

        filename:
          item.convertedName ||
          item.compressedName.replace(
            /\.[^/.]+$/,
            ""
          ) +
          "." +
          selectedFormat,
      };
    }

    return null;
  };

  /* =====================================================
     DOWNLOAD IMAGE
  ===================================================== */

  const downloadImage = (
    item: ImageResult
  ) => {
    const activeFile =
      getActiveFile(item);

    if (!activeFile) {
      alert(
        "Please wait for conversion to finish."
      );

      return;
    }

    const blob = base64ToBlob(
      activeFile.data,
      activeFile.mime
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      activeFile.filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
  };

  /* =====================================================
     PREVIEW
  ===================================================== */

  const openPreview = async (
    item: ImageResult
  ) => {
    const activeFile =
      getActiveFile(item);

    if (!activeFile) {
      alert(
        "Please wait for conversion to finish."
      );

      return;
    }

    try {
      setPreviewLoading(true);

      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl
        );
      }

      const blob = base64ToBlob(
        activeFile.data,
        activeFile.mime
      );

      const url =
        URL.createObjectURL(blob);

      setPreviewUrl(url);

      setPreviewItem(item);
    } finally {
      setPreviewLoading(false);
    }
  };

  /* =====================================================
     CLOSE PREVIEW
  ===================================================== */

  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setPreviewUrl(null);

    setPreviewItem(null);
  };

  /* =====================================================
     DOWNLOAD ZIP
  ===================================================== */

  const downloadZip = async () => {
    try {
      if (!results.length) {
        return;
      }

      setLoading(true);

      const zipFiles =
        results.map((item) => {
          const selectedFormat =
            String(
              downloadFormats[
              item.compressedName
              ] ??
              item.currentExtension
            )
              .toLowerCase()
              .trim();

          return {
            originalName:
              item.originalName,

            compressedName:
              item.compressedName,

            currentExtension:
              item.currentExtension,

            mime: item.mime,

            originalMime:
              item.originalMime,

            originalData:
              item.originalData,

            data: item.data,

            selectedFormat,
          };
        });

      const response =
        await fetch(
          "/api/download-zip",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              files: zipFiles,
            }),
          }
        );

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          errorData?.message ||
          "ZIP download failed"
        );
      }

      const blob =
        await response.blob();

      if (!blob.size) {
        throw new Error(
          "The ZIP file is empty."
        );
      }

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        "compressed-images.zip";

      document.body.appendChild(link);

      link.click();

      link.remove();

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (error: any) {
      console.error(
        "ZIP download error:",
        error
      );

      alert(
        error?.message ||
        "Unable to download ZIP."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     QUICK ZIP
  ===================================================== */

  const downloadAllAsFormatZip =
    async (format: string) => {
      try {
        if (!results.length) {
          return;
        }

        setLoading(true);

        const targetFormat =
          String(format)
            .toLowerCase()
            .trim();

        const zipFiles =
          results.map((item) => ({
            originalName:
              item.originalName,

            compressedName:
              item.compressedName,

            currentExtension:
              item.currentExtension,

            mime: item.mime,

            originalMime:
              item.originalMime,

            originalData:
              item.originalData,

            data: item.data,
          }));

        const response =
          await fetch(
            "/api/download-zip",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                files: zipFiles,

                format:
                  targetFormat,
              }),
            }
          );

        if (!response.ok) {
          const errorData =
            await response
              .json()
              .catch(() => null);

          throw new Error(
            errorData?.message ||
            `Failed to create ${targetFormat.toUpperCase()} ZIP`
          );
        }

        const blob =
          await response.blob();

        if (!blob.size) {
          throw new Error(
            "The ZIP file is empty."
          );
        }

        const url =
          URL.createObjectURL(blob);

        const link =
          document.createElement("a");

        link.href = url;

        link.download =
          `all-images-${targetFormat}.zip`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);
      } catch (error: any) {
        console.error(
          "Quick ZIP error:",
          error
        );

        alert(
          error?.message ||
          "Unable to create ZIP."
        );
      } finally {
        setLoading(false);
      }
    };

  /* =====================================================
     DROP
  ===================================================== */

  const onDrop = useCallback(
    async (
      e: DragEvent<HTMLDivElement>
    ) => {
      e.preventDefault();

      setDragging(false);

      const files = Array.from(
        e.dataTransfer.files
      );

      if (!files.length) {
        return;
      }

      setFileNames(
        files.map(
          (file) => file.name
        )
      );

      await compressImages(files);
    },
    [previewUrl]
  );

  /* =====================================================
     FILE SELECT
  ===================================================== */

  const onFileSelect = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(
      e.target.files ?? []
    );

    if (!files.length) {
      return;
    }

    setFileNames(
      files.map(
        (file) => file.name
      )
    );

    await compressImages(files);
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <>
      {/* ===================================================
          UPLOAD BOX
      =================================================== */}

      <div
        id="upload"
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() =>
          setDragging(false)
        }
        onDrop={onDrop}
        className={`relative mx-auto w-full max-w-6xl overflow-hidden rounded-xl3 border-2 border-dashed p-8 transition-all duration-300 md:p-12 ${dragging
          ? "border-primary bg-primary-50 dark:bg-primary/10"
          : "border-line bg-white/70 backdrop-blur-sm dark:border-line-dark dark:bg-card-dark/70"
          } shadow-soft`}
      >
        <div className="absolute inset-0 -z-10 bg-grid-faint opacity-40 dark:opacity-10" />

        <div className="flex flex-col items-center text-center">

          {/* =================================================
              UPLOAD ICON
          ================================================= */}

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

          {/* =================================================
              UPLOAD TEXT
          ================================================= */}

          <h3 className="text-xl font-bold text-ink dark:text-ink-dark">
            Drop your images here
          </h3>

          <p className="mt-1.5 text-sm text-muted dark:text-muted-dark">
            or click below to browse from your device
          </p>

          {/* =================================================
              UPLOAD BUTTON
          ================================================= */}

          <label className="btn-ripple mt-6 cursor-pointer rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-lift">

            Upload Images

            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={onFileSelect}
            />

          </label>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/10 px-5 py-3">

              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />

              <span className="text-sm font-medium text-primary">
                Compressing images...
              </span>

            </div>
          )}

          {/* =================================================
              SELECTED FILES
          ================================================= */}

          {fileNames.length > 0 && (
            <motion.p
              initial={{
                opacity: 0,
                y: 6,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mt-4 text-xs font-medium text-secondary-600 dark:text-secondary"
            >
              Selected:{" "}
              {fileNames.join(", ")}

              {fileNames.length === 3
                ? " …"
                : ""}
            </motion.p>
          )}

          {/* =================================================
              IMAGE RESULTS
          ================================================= */}

          {results.length > 0 && (
            <div className="mt-6 w-full space-y-3">

              {results.map((item) => {
                const selectedFormat =
                  downloadFormats[item.compressedName] ??
                  item.currentExtension;

                const isConverting =
                  converting[item.compressedName] === true;

                const activeFile =
                  getActiveFile(item);

                const originalExtension =
                  getOriginalExtension(item);

                return (
                  <motion.div
                    key={item.compressedName}
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
                    className="w-full"
                  >

                    {/* =================================================
              SMALL TINYPNG STYLE IMAGE CARD
          ================================================= */}

                    <div className="overflow-hidden rounded-xl border border-line bg-white shadow-soft dark:border-line-dark dark:bg-card-dark">

                      <div className="flex flex-col lg:flex-row">

                        {/* =================================================
                  LEFT SIDE
              ================================================= */}

                        <div className="flex min-w-0 flex-1">

                          {/* =================================================
                    SMALL IMAGE
                ================================================= */}

                          <div
                            className="group relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden bg-slate-100 dark:bg-slate-950 sm:h-24 sm:w-24"
                            onClick={() => openPreview(item)}
                          >
                            {item.data ? (
                              <img
                                src={`data:${item.mime};base64,${item.data}`}
                                alt={item.originalName}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-muted">
                                No preview
                              </div>
                            )}

                            {/* IMAGE OVERLAY */}

                            <div className="absolute inset-0 bg-black/0 transition-all duration-200 group-hover:bg-black/30" />

                            {/* EYE */}

                            <button
                              type="button"
                              aria-label="Preview image"
                              disabled={
                                isConverting ||
                                !activeFile
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                openPreview(item);
                              }}
                              className="absolute left-1/2 top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink opacity-0 shadow-md transition-all duration-200 group-hover:opacity-100 hover:scale-105 disabled:cursor-not-allowed dark:bg-card-dark dark:text-white"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>

                            {/* SECURITY */}

                            <div className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
                              <ShieldCheck className="h-2.5 w-2.5" />
                            </div>
                          </div>

                          {/* =================================================
                    FILE INFORMATION
                ================================================= */}

                          <div className="flex min-w-0 flex-1 flex-col justify-center px-3 py-3 text-left sm:px-4">

                            {/* FILE NAME */}

                            <h4 className="break-all text-sm font-semibold leading-4 text-ink dark:text-ink-dark">
                              {item.originalName}
                            </h4>

                            {/* =================================================
                      TYPE + SIZE
                  ================================================= */}

                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">

                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                {originalExtension.toUpperCase()}
                              </span>

                              <span className="text-xs font-medium text-muted dark:text-muted-dark">
                                {(
                                  item.originalSize / 1024
                                ).toFixed(2)}{" "}
                                KB
                              </span>

                            </div>

                            {/* =================================================
                      CONVERT TO
                  ================================================= */}

                            <div className="mt-2 flex flex-wrap items-center gap-1">

                              <span className="mr-0.5 shrink-0 text-xs font-semibold text-muted dark:text-muted-dark">
                                Convert to
                              </span>

                              {FORMAT_OPTIONS.map(
                                (option) => {
                                  const isSelected =
                                    selectedFormat ===
                                    option.value;

                                  return (
                                    <button
                                      key={option.value}
                                      type="button"
                                      disabled={
                                        isConverting
                                      }
                                      onClick={() =>
                                        handleFormatChange(
                                          item,
                                          option.value
                                        )
                                      }
                                      className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase transition-all duration-200 ${isSelected
                                        ? "border-primary bg-primary text-white shadow-sm"
                                        : "border-line bg-white text-ink hover:border-primary hover:text-primary dark:border-line-dark dark:bg-card-dark dark:text-ink-dark dark:hover:border-primary dark:hover:text-primary"
                                        } disabled:cursor-not-allowed disabled:opacity-50`}
                                    >
                                      {option.label}
                                    </button>
                                  );
                                }
                              )}

                            </div>

                            {/* =================================================
                      CONVERSION LOADING
                  ================================================= */}

                            {isConverting && (
                              <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-primary">

                                <Loader2 className="h-3.5 w-3.5 animate-spin" />

                                Converting to{" "}
                                {selectedFormat.toUpperCase()}
                                ...

                              </div>
                            )}

                          </div>

                        </div>

                        {/* =================================================
                  COMPRESSION RESULT
              ================================================= */}

                        <div className="flex min-w-[150px] items-center justify-between gap-3 border-t border-line px-3 py-3 lg:border-l lg:border-t-0 dark:border-line-dark">

                          {/* SAVING */}

                          <div className="text-left">

                            <div className="text-lg font-bold leading-5 text-green-600 dark:text-green-400">
                              –{item.saved}%
                            </div>

                            <div className="mt-0.5 text-xs font-medium text-muted dark:text-muted-dark">
                              {(
                                item.compressedSize / 1024
                              ).toFixed(2)}{" "}
                              KB
                            </div>

                          </div>

                          {/* DOWNLOAD */}

                          <button
                            type="button"
                            disabled={
                              isConverting ||
                              !activeFile
                            }
                            onClick={() =>
                              downloadImage(item)
                            }
                            className="flex min-w-[64px] flex-col items-center justify-center rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-2 text-primary transition-all hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            <Download className="mb-0.5 h-3.5 w-3.5" />

                            <span className="text-[10px] font-bold uppercase">
                              {selectedFormat}
                            </span>

                          </button>

                        </div>

                      </div>

                    </div>

                  </motion.div>
                );
              })}

            </div>
          )}

          {/* =================================================
              ZIP SECTION
          ================================================= */}

          {results.length > 1 && (
            <div className="mt-8 w-full">

              <div className="rounded-2xl border border-line bg-white p-5 shadow-soft dark:border-line-dark dark:bg-card-dark">

                <div className="text-left">

                  <h3 className="text-base font-bold text-ink dark:text-ink-dark">
                    Download all images
                  </h3>

                  <p className="mt-1 text-sm text-muted dark:text-muted-dark">
                    Download all images as a ZIP using their selected formats,
                    or quickly convert everything to one format.
                  </p>

                </div>

                {/* =================================================
                    SELECTED FORMAT ZIP
                ================================================= */}

                <div className="mt-4 flex justify-center">

                  <button
                    type="button"
                    onClick={downloadZip}
                    disabled={loading}
                    className="inline-flex w-auto items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading
                      ? "Preparing ZIP..."
                      : "Download Selected Formats as ZIP"}
                  </button>

                </div>

                {/* =================================================
                    DIVIDER
                ================================================= */}

                <div className="my-5 flex items-center gap-3">

                  <div className="h-px flex-1 bg-line dark:bg-line-dark" />

                  <span className="text-xs font-medium text-muted dark:text-muted-dark">
                    QUICK ZIP — CONVERT ALL
                  </span>

                  <div className="h-px flex-1 bg-line dark:bg-line-dark" />

                </div>

                {/* =================================================
                    QUICK ZIP BUTTONS
                ================================================= */}

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      downloadAllAsFormatZip(
                        "jpg"
                      )
                    }
                    className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-primary hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-line-dark dark:bg-card-dark dark:text-ink-dark"
                  >
                    All JPG
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      downloadAllAsFormatZip(
                        "png"
                      )
                    }
                    className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-primary hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-line-dark dark:bg-card-dark dark:text-ink-dark"
                  >
                    All PNG
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      downloadAllAsFormatZip(
                        "webp"
                      )
                    }
                    className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-primary hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-line-dark dark:bg-card-dark dark:text-ink-dark"
                  >
                    All WEBP
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      downloadAllAsFormatZip(
                        "avif"
                      )
                    }
                    className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-primary hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-line-dark dark:bg-card-dark dark:text-ink-dark"
                  >
                    All AVIF
                  </button>

                </div>

              </div>

            </div>
          )}

          {/* =================================================
              FEATURE PILLS
          ================================================= */}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">

            {PILLS.map(
              ({
                icon: Icon,
                label,
              }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-muted transition-colors duration-300 hover:border-primary/40 hover:text-primary dark:border-line-dark dark:bg-card-dark dark:text-muted-dark"
                >
                  <Icon
                    className="h-3.5 w-3.5 text-secondary"
                    strokeWidth={2.2}
                  />

                  {label}
                </span>
              )
            )}

          </div>

        </div>
      </div>

      {/* =====================================================
          PREVIEW MODAL
      ===================================================== */}

      {previewItem && previewUrl && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={closePreview}
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
            onClick={(e) =>
              e.stopPropagation()
            }
            className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-card-dark"
          >

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="flex items-center justify-between border-b border-line px-5 py-4 dark:border-line-dark">

              <div className="min-w-0 text-left">

                <h3 className="truncate font-semibold text-ink dark:text-ink-dark">
                  {
                    getActiveFile(
                      previewItem
                    )?.filename
                  }
                </h3>

                <p className="mt-1 text-xs text-muted dark:text-muted-dark">

                  {(
                    (getActiveFile(
                      previewItem
                    )?.size || 0) /
                    1024
                  ).toFixed(2)}{" "}
                  KB

                  {" · "}

                  {(
                    downloadFormats[
                    previewItem
                      .compressedName
                    ] ??
                    previewItem.currentExtension
                  ).toUpperCase()}

                </p>

              </div>

              <button
                type="button"
                onClick={closePreview}
                className="rounded-full p-2 text-muted transition hover:bg-black/5 hover:text-ink dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* =================================================
                IMAGE PREVIEW
            ================================================= */}

            <div className="flex min-h-[300px] flex-1 items-center justify-center overflow-auto bg-slate-100 p-6 dark:bg-slate-950">

              {previewLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted">

                  <Loader2 className="h-5 w-5 animate-spin" />

                  Loading preview...

                </div>
              ) : (
                <img
                  src={previewUrl}
                  alt={
                    previewItem.originalName
                  }
                  className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-lg"
                />
              )}

            </div>

            {/* =================================================
                MODAL FOOTER
            ================================================= */}

            <div className="flex flex-col gap-3 border-t border-line p-4 sm:flex-row dark:border-line-dark">

              <button
                type="button"
                onClick={closePreview}
                className="flex-1 rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-primary hover:text-primary dark:border-line-dark dark:text-ink-dark"
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
    </>
  );
}