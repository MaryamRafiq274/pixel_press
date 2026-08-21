"use client";

import {
    ChangeEvent,
    DragEvent,
    useCallback,
    useState,
} from "react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { motion } from "framer-motion";

import {
    UploadCloud,
    Download,
    Trash2,
    X,
    FileImage,
    CheckCircle2,
    Loader2,
    Archive,
    Eye,
    FolderArchive,
} from "lucide-react";

// =====================================================
// TYPES
// =====================================================

type SupportedFormat =
    | "jpg"
    | "png"
    | "webp"
    | "avif"
    | "svg";

type ConverterFile = {
    id: string;
    file: File;

    originalName: string;
    originalSize: number;
    originalFormat: string;

    selectedFormat: SupportedFormat;

    status:
        | "pending"
        | "converting"
        | "completed"
        | "error";

    convertedName?: string;
    convertedSize?: number;
    convertedData?: string;
    convertedMime?: string;

    error?: string;
};

// =====================================================
// CONSTANTS
// =====================================================

const FORMATS: {
    value: SupportedFormat;
    label: string;
}[] = [
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

// =====================================================
// HELPERS
// =====================================================

function getFileExtension(filename: string): string {
    const extension =
        filename.split(".").pop()?.toLowerCase() || "";

    if (extension === "jpeg") {
        return "jpg";
    }

    return extension;
}

function getMimeType(format: SupportedFormat): string {
    switch (format) {
        case "jpg":
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
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(2)} KB`;
    }

    return `${(
        bytes /
        (1024 * 1024)
    ).toFixed(2)} MB`;
}

function createId(): string {
    return `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}`;
}

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result;

            if (typeof result !== "string") {
                reject(
                    new Error(
                        "Unable to read file."
                    )
                );

                return;
            }

            const base64 = result.includes(",")
                ? result.split(",")[1]
                : result;

            resolve(base64);
        };

        reader.onerror = () => {
            reject(
                new Error(
                    "Unable to read file."
                )
            );
        };

        reader.readAsDataURL(file);
    });
}

// =====================================================
// COMPONENT
// =====================================================

export default function ImageConverter() {
    const [files, setFiles] =
        useState<ConverterFile[]>([]);

    const [isDragging, setIsDragging] =
        useState(false);

    const [isConverting, setIsConverting] =
        useState(false);

    const [isDownloadingZip, setIsDownloadingZip] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    // ===================================================
    // PREVIEW STATE
    // ===================================================

    const [previewItem, setPreviewItem] =
        useState<ConverterFile | null>(null);

    const [previewUrl, setPreviewUrl] =
        useState<string | null>(null);

    const [previewLoading, setPreviewLoading] =
        useState(false);

    // ===================================================
    // ADD FILES
    // ===================================================

    const addFiles = useCallback(
        (selectedFiles: File[]) => {
            const imageFiles =
                selectedFiles.filter(
                    (file) =>
                        file.type.startsWith("image/") ||
                        /\.(jpg|jpeg|png|webp|avif|svg)$/i.test(
                            file.name
                        )
                );

            if (imageFiles.length === 0) {
                return;
            }

            const newFiles: ConverterFile[] =
                imageFiles.map((file) => {
                    const originalFormat =
                        getFileExtension(
                            file.name
                        );

                    return {
                        id: createId(),

                        file,

                        originalName:
                            file.name,

                        originalSize:
                            file.size,

                        originalFormat,

                        selectedFormat:
                            originalFormat === "jpg"
                                ? "png"
                                : "jpg",

                        status: "pending",
                    };
                });

            setFiles((previous) => [
                ...previous,
                ...newFiles,
            ]);
        },
        []
    );

    // ===================================================
    // FILE INPUT
    // ===================================================

    const handleFileChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const selectedFiles =
            Array.from(
                event.target.files || []
            );

        addFiles(selectedFiles);

        event.target.value = "";
    };

    // ===================================================
    // DRAG EVENTS
    // ===================================================

    const handleDragOver = (
        event: DragEvent<HTMLDivElement>
    ) => {
        event.preventDefault();

        setIsDragging(true);
    };

    const handleDragLeave = (
        event: DragEvent<HTMLDivElement>
    ) => {
        event.preventDefault();

        setIsDragging(false);
    };

    const handleDrop = (
        event: DragEvent<HTMLDivElement>
    ) => {
        event.preventDefault();

        setIsDragging(false);

        const droppedFiles =
            Array.from(
                event.dataTransfer.files
            );

        addFiles(droppedFiles);
    };

    // ===================================================
    // CLOSE PREVIEW
    // ===================================================

    const closePreview = () => {
        setPreviewItem(null);
        setPreviewUrl(null);
        setPreviewLoading(false);
    };

    // ===================================================
    // REMOVE FILE
    // ===================================================

    const removeFile = (id: string) => {
        setFiles((previous) =>
            previous.filter(
                (file) =>
                    file.id !== id
            )
        );

        if (
            previewItem?.id === id
        ) {
            closePreview();
        }
    };

    // ===================================================
    // CLEAR ALL
    // ===================================================

    const clearFiles = () => {
        closePreview();

        setFiles([]);
    };

    // ===================================================
    // CHANGE FORMAT
    // ===================================================

    const changeFormat = (
        id: string,
        format: SupportedFormat
    ) => {
        setFiles((previous) =>
            previous.map((file) =>
                file.id === id
                    ? {
                        ...file,

                        selectedFormat:
                            format,

                        status:
                            "pending",

                        convertedData:
                            undefined,

                        convertedName:
                            undefined,

                        convertedSize:
                            undefined,

                        convertedMime:
                            undefined,

                        error:
                            undefined,
                    }
                    : file
            )
        );
    };

    // ===================================================
    // CONVERT SINGLE FILE
    // ===================================================

    const convertSingleFile = async (
        converterFile: ConverterFile
    ) => {
        const {
            file,
            selectedFormat,
        } = converterFile;

        setFiles((previous) =>
            previous.map((item) =>
                item.id ===
                    converterFile.id
                    ? {
                        ...item,

                        status:
                            "converting",

                        error:
                            undefined,
                    }
                    : item
            )
        );

        try {
            const base64 =
                await fileToBase64(file);

            const currentExtension =
                getFileExtension(
                    file.name
                );

            const response =
                await fetch(
                    "/api/convert",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            data: base64,

                            filename:
                                file.name,

                            format:
                                selectedFormat,

                            currentExtension,

                            originalMime:
                                file.type,
                        }),
                    }
                );

            const result =
                await response.json();

            if (
                !response.ok ||
                !result.success
            ) {
                throw new Error(
                    result.message ||
                    "Conversion failed."
                );
            }

            setFiles((previous) =>
                previous.map((item) =>
                    item.id ===
                        converterFile.id
                        ? {
                            ...item,

                            status:
                                "completed",

                            convertedName:
                                result.filename,

                            convertedSize:
                                result.size,

                            convertedData:
                                result.data,

                            convertedMime:
                                result.mime,
                        }
                        : item
                )
            );
        } catch (error: any) {
            console.error(
                "Conversion error:",
                error
            );

            setFiles((previous) =>
                previous.map((item) =>
                    item.id ===
                        converterFile.id
                        ? {
                            ...item,

                            status:
                                "error",

                            error:
                                error?.message ||
                                "Conversion failed.",
                        }
                        : item
                )
            );
        }
    };

    // ===================================================
    // CONVERT ALL
    // ===================================================

    const convertAll = async () => {
        if (
            files.length === 0 ||
            isConverting
        ) {
            return;
        }

        setIsConverting(true);

        try {
            for (const file of files) {
                await convertSingleFile(
                    file
                );
            }
        } finally {
            setIsConverting(false);
        }
    };

    // ===================================================
    // DOWNLOAD SINGLE
    // ===================================================

    const downloadFile = (
        file: ConverterFile
    ) => {
        if (
            !file.convertedData
        ) {
            return;
        }

        const mime =
            file.convertedMime ||
            getMimeType(
                file.selectedFormat
            );

        const binary =
            atob(
                file.convertedData
            );

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

        const blob =
            new Blob(
                [bytes],
                {
                    type: mime,
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const anchor =
            document.createElement(
                "a"
            );

        anchor.href = url;

        anchor.download =
            file.convertedName ||
            file.originalName;

        document.body.appendChild(
            anchor
        );

        anchor.click();

        anchor.remove();

        URL.revokeObjectURL(url);
    };

    // ===================================================
    // DOWNLOAD ALL INDIVIDUALLY
    // ===================================================

    const downloadAll = () => {
        const completed =
            files.filter(
                (file) =>
                    file.status ===
                    "completed" &&
                    !!file.convertedData
            );

        completed.forEach(
            (file, index) => {
                setTimeout(() => {
                    downloadFile(file);
                }, index * 250);
            }
        );
    };

    // ===================================================
    // DOWNLOAD ALL AS ZIP
    // ===================================================

    const downloadAllAsZip = async () => {
        const completedFiles = files.filter(
            (file) =>
                file.status === "completed" &&
                file.convertedData &&
                file.convertedName
        );

        if (completedFiles.length === 0) {
            alert(
                "No converted files available for ZIP download."
            );
            return;
        }

        try {
            const zipFiles = completedFiles.map(
                (file) => ({
                    filename:
                        file.convertedName ||
                        file.originalName,

                    data:
                        file.convertedData!,

                    mime:
                        file.convertedMime ||
                        getMimeType(
                            file.selectedFormat
                        ),
                })
            );

            console.log(
                "Sending files to ZIP:",
                zipFiles.length
            );

            const response =
                await fetch(
                    "/image-converter/download-zip",
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
                const error =
                    await response
                        .json()
                        .catch(
                            () => null
                        );

                throw new Error(
                    error?.message ||
                    "ZIP download failed."
                );
            }

            const blob =
                await response.blob();

            if (blob.size === 0) {
                throw new Error(
                    "The ZIP file is empty."
                );
            }

            const url =
                URL.createObjectURL(
                    blob
                );

            const link =
                document.createElement(
                    "a"
                );

            link.href = url;

            link.download =
                "converted-images.zip";

            document.body.appendChild(
                link
            );

            link.click();

            link.remove();

            URL.revokeObjectURL(
                url
            );

            console.log(
                "ZIP download successful."
            );
        } catch (error) {
            console.error(
                "ZIP download failed:",
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : "ZIP download failed."
            );
        }
    };

    // ===================================================
    // THUMBNAIL
    // ===================================================

    const getThumbnailUrl = (
        file: ConverterFile
    ) => {
        if (file.file) {
            return URL.createObjectURL(
                file.file
            );
        }

        return null;
    };

    // ===================================================
    // PREVIEW
    // ===================================================

    const openPreview = (
        file: ConverterFile
    ) => {
        if (
            !file.convertedData
        ) {
            return;
        }

        setPreviewLoading(true);

        setPreviewItem(file);

        try {
            const mime =
                file.convertedMime ||
                getMimeType(
                    file.selectedFormat
                );

            const dataUrl =
                `data:${mime};base64,${file.convertedData}`;

            setPreviewUrl(
                dataUrl
            );
        } catch (error) {
            console.error(
                "Preview error:",
                error
            );

            setPreviewUrl(null);
        } finally {
            setPreviewLoading(
                false
            );
        }
    };

    // ===================================================
    // COUNTS
    // ===================================================

    const completedCount =
        files.filter(
            (file) =>
                file.status ===
                "completed"
        ).length;

    // ===================================================
    // RENDER
    // ===================================================

    return (
        <>
            <Header />

            <section className="w-full">
                <div
                    aria-hidden
                    className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/15 via-secondary/10 to-transparent blur-3xl"
                />

                <div className="mx-auto max-w-6xl px-4 py-10">

                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div className="mb-10 text-center">
                        <motion.h1
                            initial={{
                                opacity: 0,
                                y: 16,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                duration: 0.55,
                                delay: 0.05,
                            }}
                            className="text-balance text-hero-sm text-ink dark:text-ink-dark md:text-hero"
                        >
                            Image Format{" "}
                            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                Converter
                            </span>
                        </motion.h1>
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
                            "relative overflow-hidden rounded-3xl border-2 border-dashed p-10 text-center transition-all",
                            isDragging
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-300 bg-white hover:border-blue-400",
                        ].join(" ")}
                    >
                        <div className="mx-auto flex max-w-xl flex-col items-center">

                            {/* UPLOAD ICON */}

                            <div className="relative mb-6 flex h-20 w-28 items-center justify-center">
                                <motion.div
                                    aria-hidden
                                    className="absolute h-14 w-24 origin-center rounded-xl2 bg-gradient-to-br from-primary to-secondary shadow-lift"
                                    animate={{
                                        scaleX: [
                                            1,
                                            0.82,
                                            1,
                                        ],
                                    }}
                                    transition={{
                                        duration: 2.6,
                                        repeat:
                                            Infinity,
                                        ease: "easeInOut",
                                    }}
                                />

                                <motion.div
                                    initial={{
                                        y: -6,
                                        opacity: 0,
                                    }}
                                    animate={{
                                        y: [
                                            0,
                                            -6,
                                            0,
                                        ],
                                        opacity: 1,
                                    }}
                                    transition={{
                                        duration: 2.6,
                                        repeat:
                                            Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="relative z-10"
                                >
                                    <UploadCloud
                                        className="h-8 w-8 text-white"
                                        strokeWidth={
                                            2.2
                                        }
                                    />
                                </motion.div>
                            </div>

                            {/* UPLOAD TEXT */}

                            <h3 className="text-xl font-bold text-ink dark:text-ink-dark">
                                Drop your images here
                            </h3>

                            <p className="mt-1.5 text-sm text-muted dark:text-muted-dark">
                                or click below to browse from your device
                            </p>

                            {/* UPLOAD BUTTON */}

                            <label className="mt-8 mb-3 cursor-pointer">
                                <span className="btn-ripple mt-6 cursor-pointer rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-lift">
                                    Choose Images
                                </span>

                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
                                    multiple
                                    className="hidden"
                                    onChange={
                                        handleFileChange
                                    }
                                />
                            </label>

                            <p className="mt-4 text-sm text-gray-400">
                                JPG, JPEG, PNG, WEBP, AVIF and SVG
                            </p>
                        </div>
                    </div>

                    {/* =================================================
                        FILE LIST
                    ================================================= */}

                    {files.length > 0 && (
                        <div className="mt-8">

                            {/* FILE LIST HEADER */}

                            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Your Images
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        {files.length}{" "}
                                        {files.length ===
                                        1
                                            ? "image"
                                            : "images"}{" "}
                                        selected
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        clearFiles
                                    }
                                    className="inline-flex items-center gap-2 self-start text-sm font-medium text-red-600 transition hover:text-red-700 sm:self-auto"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Clear All
                                </button>
                            </div>

                            {/* IMAGE CARDS */}

                            <div className="space-y-3">
                                {files.map(
                                    (file) => {
                                        const thumbnailUrl =
                                            getThumbnailUrl(
                                                file
                                            );

                                        return (
                                            <motion.div
                                                key={
                                                    file.id
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
                                                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md"
                                            >
                                                <div className="flex min-h-[112px]">

                                                    {/* LEFT - IMAGE THUMBNAIL */}

                                                    <div
                                                        className="group relative h-[112px] w-[112px] shrink-0 cursor-pointer overflow-hidden bg-gray-100"
                                                        onClick={() =>
                                                            openPreview(
                                                                file
                                                            )
                                                        }
                                                    >

                                                        {/* ACTUAL IMAGE */}

                                                        {thumbnailUrl ? (
                                                            <img
                                                                src={
                                                                    thumbnailUrl
                                                                }
                                                                alt={
                                                                    file.originalName
                                                                }
                                                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                                onError={(
                                                                    event
                                                                ) => {
                                                                    event.currentTarget.style.display =
                                                                        "none";
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center">
                                                                <FileImage className="h-9 w-9 text-gray-400" />
                                                            </div>
                                                        )}

                                                        {/* DARK OVERLAY */}

                                                        <div className="absolute inset-0 bg-black/0 transition-all duration-200 group-hover:bg-black/35" />

                                                        {/* PREVIEW EYE */}

                                                        <button
                                                            type="button"
                                                            aria-label="Preview image"
                                                            title="Preview"
                                                            onClick={(
                                                                event
                                                            ) => {
                                                                event.stopPropagation();

                                                                openPreview(
                                                                    file
                                                                );
                                                            }}
                                                            className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-gray-800 opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 hover:scale-110"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>

                                                        {/* FORMAT BADGE */}

                                                        <div className="absolute left-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                                                            {
                                                                file.originalFormat
                                                            }
                                                        </div>
                                                    </div>

                                                    {/* MIDDLE CONTENT */}

                                                    <div className="flex min-w-0 flex-1 flex-col">

                                                        {/* MAIN ROW */}

                                                        <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5">

                                                            {/* FILE INFORMATION */}

                                                            <div className="min-w-0 flex-1">
                                                                <p
                                                                    className="truncate text-sm font-semibold text-gray-900"
                                                                    title={
                                                                        file.originalName
                                                                    }
                                                                >
                                                                    {
                                                                        file.originalName
                                                                    }
                                                                </p>

                                                                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">

                                                                    <span>
                                                                        {formatFileSize(
                                                                            file.originalSize
                                                                        )}
                                                                    </span>

                                                                    <span className="text-gray-300">
                                                                        •
                                                                    </span>

                                                                    <span className="font-semibold uppercase">
                                                                        {
                                                                            file.originalFormat
                                                                        }
                                                                    </span>

                                                                    {file.status ===
                                                                        "completed" &&
                                                                        file.convertedSize && (
                                                                            <>
                                                                                <span className="text-gray-300">
                                                                                    →
                                                                                </span>

                                                                                <span className="font-semibold text-green-600">
                                                                                    {formatFileSize(
                                                                                        file.convertedSize
                                                                                    )}
                                                                                </span>
                                                                            </>
                                                                        )}
                                                                </div>

                                                                {/* CONVERTED FILE NAME */}

                                                                {file.status ===
                                                                    "completed" &&
                                                                    file.convertedName && (
                                                                        <p
                                                                            className="mt-1 truncate text-[11px] text-gray-400"
                                                                            title={
                                                                                file.convertedName
                                                                            }
                                                                        >
                                                                            {
                                                                                file.convertedName
                                                                            }
                                                                        </p>
                                                                    )}
                                                            </div>

                                                            {/* CONVERSION CONTROLS */}

                                                            <div className="mt-3 flex shrink-0 items-center gap-2 sm:mt-0">

                                                                {/* CONVERT TO */}

                                                                <span className="hidden text-xs font-medium text-gray-500 lg:block">
                                                                    Convert to
                                                                </span>

                                                                {/* FORMAT SELECT */}

                                                                <select
                                                                    value={
                                                                        file.selectedFormat
                                                                    }
                                                                    onChange={(
                                                                        event
                                                                    ) =>
                                                                        changeFormat(
                                                                            file.id,
                                                                            event
                                                                                .target
                                                                                .value as SupportedFormat
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        file.status ===
                                                                        "converting"
                                                                    }
                                                                    className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                                                                >
                                                                    {FORMATS.map(
                                                                        (
                                                                            format
                                                                        ) => (
                                                                            <option
                                                                                key={
                                                                                    format.value
                                                                                }
                                                                                value={
                                                                                    format.value
                                                                                }
                                                                            >
                                                                                {
                                                                                    format.label
                                                                                }
                                                                            </option>
                                                                        )
                                                                    )}
                                                                </select>

                                                                {/* CONVERT BUTTON */}

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        convertSingleFile(
                                                                            file
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        file.status ===
                                                                        "converting"
                                                                    }
                                                                    className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                                >
                                                                    {file.status ===
                                                                    "converting" ? (
                                                                        <>
                                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                            Converting
                                                                        </>
                                                                    ) : (
                                                                        "Convert"
                                                                    )}
                                                                </button>

                                                                {/* DOWNLOAD BUTTON */}

                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        file.status !==
                                                                            "completed" ||
                                                                        !file.convertedData
                                                                    }
                                                                    onClick={() =>
                                                                        downloadFile(
                                                                            file
                                                                        )
                                                                    }
                                                                    aria-label="Download converted image"
                                                                    title="Download"
                                                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-600/20 bg-blue-600/5 text-blue-600 transition-all hover:border-blue-600 hover:bg-blue-600/10 disabled:cursor-not-allowed disabled:opacity-30"
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* CONVERTING STATUS */}

                                                        {file.status ===
                                                            "converting" && (
                                                            <div className="border-t border-blue-100 bg-blue-50/60 px-4 py-2">
                                                                <div className="flex items-center gap-2">
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />

                                                                    <span className="text-xs font-medium text-blue-600">
                                                                        Converting to{" "}
                                                                        {file.selectedFormat.toUpperCase()}
                                                                        ...
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* COMPLETED STATUS */}

                                                        {file.status ===
                                                            "completed" &&
                                                            file.convertedData && (
                                                                <div className="flex items-center gap-2 border-t border-green-100 bg-green-50/60 px-4 py-2">
                                                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />

                                                                    <span className="text-xs font-semibold text-green-700">
                                                                        Conversion complete
                                                                    </span>
                                                                </div>
                                                            )}

                                                        {/* ERROR */}

                                                        {file.status ===
                                                            "error" && (
                                                            <div className="border-t border-red-100 bg-red-50 px-4 py-2.5 text-xs text-red-700">
                                                                {
                                                                    file.error
                                                                }
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* RIGHT - REMOVE */}

                                                    <div className="flex w-11 shrink-0 items-center justify-center border-l border-gray-100">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeFile(
                                                                    file.id
                                                                )
                                                            }
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                                                            aria-label="Remove image"
                                                            title="Remove"
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

                            {/* ACTIONS */}

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">

                                {/* CONVERT ALL */}

                                <button
                                    type="button"
                                    onClick={
                                        convertAll
                                    }
                                    disabled={
                                        isConverting ||
                                        files.length ===
                                            0
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isConverting ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Converting...
                                        </>
                                    ) : (
                                        <>
                                            <FileImage className="h-5 w-5" />
                                            Convert All Images
                                        </>
                                    )}
                                </button>

                                {/* DOWNLOAD ALL */}

                                <button
                                    type="button"
                                    onClick={
                                        downloadAll
                                    }
                                    disabled={
                                        completedCount ===
                                        0
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-7 py-3.5 font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Archive className="h-5 w-5" />
                                    Download All
                                </button>

                                {/* DOWNLOAD ZIP */}

                                <button
                                    type="button"
                                    onClick={
                                        downloadAllAsZip
                                    }
                                    disabled={
                                        completedCount ===
                                            0 ||
                                        isDownloadingZip
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-600 bg-blue-50 px-7 py-3.5 font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isDownloadingZip ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Creating ZIP...
                                        </>
                                    ) : (
                                        <>
                                            <FolderArchive className="h-5 w-5" />
                                            Download All as ZIP
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* READY MESSAGE */}

                            {completedCount >
                                0 && (
                                <p className="mt-4 text-center text-sm text-gray-500">
                                    {
                                        completedCount
                                    }{" "}
                                    {completedCount ===
                                    1
                                        ? "image is"
                                        : "images are"}{" "}
                                    ready to download.
                                </p>
                            )}
                        </div>
                    )}

                    {/* =================================================
                        FEATURES
                    ================================================= */}

                    <div className="mt-16 grid gap-6 md:grid-cols-3">

                        {/* MULTIPLE FORMATS */}

                        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center transition hover:-translate-y-1 hover:shadow-md">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                                <FileImage className="h-6 w-6 text-blue-600" />
                            </div>

                            <h3 className="text-base font-semibold text-ink dark:text-ink-dark">
                                Multiple Formats
                            </h3>

                            <p className="mt-1.5 text-sm leading-relaxed text-muted dark:text-muted-dark">
                                Convert between JPG, PNG, WEBP, AVIF and SVG.
                            </p>
                        </div>

                        {/* CONVERSION ONLY */}

                        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center transition hover:-translate-y-1 hover:shadow-md">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>

                            <h3 className="text-base font-semibold text-ink dark:text-ink-dark">
                                Conversion Only
                            </h3>

                            <p className="mt-1.5 text-sm leading-relaxed text-muted dark:text-muted-dark">
                                This page converts image formats without using your compression pipeline.
                            </p>
                        </div>

                        {/* EASY DOWNLOADS */}

                        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center transition hover:-translate-y-1 hover:shadow-md">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-50">
                                <Download className="h-6 w-6 text-purple-600" />
                            </div>

                            <h3 className="text-base font-semibold text-ink dark:text-ink-dark">
                                Easy Downloads
                            </h3>

                            <p className="mt-1.5 text-sm leading-relaxed text-muted dark:text-muted-dark">
                                Convert multiple images and download the results individually or together.
                            </p>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    PREVIEW MODAL
                ================================================= */}

                {previewItem &&
                    previewUrl && (
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
                                onClick={(
                                    event
                                ) =>
                                    event.stopPropagation()
                                }
                                className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                            >

                                {/* MODAL HEADER */}

                                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                                    <div className="min-w-0 text-left">
                                        <h3 className="truncate font-semibold text-gray-900">
                                            {previewItem.convertedName ||
                                                previewItem.originalName}
                                        </h3>

                                        <p className="mt-1 text-xs text-gray-500">
                                            {formatFileSize(
                                                previewItem.convertedSize ||
                                                    previewItem.originalSize ||
                                                    0
                                            )}

                                            {" · "}

                                            {previewItem.selectedFormat.toUpperCase()}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={
                                            closePreview
                                        }
                                        className="rounded-full p-2 text-gray-500 transition hover:bg-black/5 hover:text-gray-900"
                                        aria-label="Close preview"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* IMAGE PREVIEW */}

                                <div className="flex min-h-[300px] flex-1 items-center justify-center overflow-auto bg-slate-100 p-6">
                                    {previewLoading ? (
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Loader2 className="h-5 w-5 animate-spin" />

                                            Loading preview...
                                        </div>
                                    ) : (
                                        <img
                                            src={
                                                previewUrl
                                            }
                                            alt={
                                                previewItem.originalName
                                            }
                                            className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-lg"
                                        />
                                    )}
                                </div>

                                {/* MODAL FOOTER */}

                                <div className="flex flex-col gap-3 border-t border-gray-200 p-4 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={
                                            closePreview
                                        }
                                        className="flex-1 rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:border-blue-600 hover:text-blue-600"
                                    >
                                        Close
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            downloadFile(
                                                previewItem
                                            );

                                            closePreview();
                                        }}
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
            </section>

            <Footer />
        </>
    );
}