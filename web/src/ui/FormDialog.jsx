import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

const FormDialog = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  size = "md",
  disableSubmit = false,
  loading = false,
  hideFooter = false,
  icon = null,
  errorMessage = "",
  submitVariant = "primary", // primary | danger
  footerContent = null, // custom extra footer content (left side)
  stickyFooter = true,
}) => {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-4xl", // larger dialog option
  };

  // submit button styles handled inline via submitVariant

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full ${sizeClasses[size]} transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all border border-gray-100`}
              >
                <div className="flex items-start justify-between px-5 pt-5 pb-4 mb-4 border-b">
                  <div className="flex gap-3">
                    {icon && <div className="mt-1">{icon}</div>}
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-semibold text-gray-900"
                      >
                        {title}
                      </Dialog.Title>
                      {description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {description}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition"
                    aria-label="Close dialog"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto pl-5 pr-6 custom-scrollbar">
                  {children}
                </div>
                {errorMessage && (
                  <div className="mt-3 text-sm text-red-600">
                    {errorMessage}
                  </div>
                )}

                {!hideFooter && (
                  <div
                    className={`mt-6 pt-4 px-5 flex ${
                      footerContent ? "justify-between" : "justify-end"
                    } items-center gap-3 border-t ${
                      stickyFooter ? "sticky bottom-0 bg-white" : ""
                    }`}
                  >
                    {footerContent && (
                      <div className="text-xs text-gray-500">
                        {footerContent}
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={onClose}
                        disabled={loading}
                      >
                        {cancelLabel}
                      </button>
                      <button
                        type="button"
                        className={`inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 shadow-sm transition ${
                          disableSubmit || loading
                            ? "bg-gray-300 cursor-not-allowed"
                            : submitVariant === "danger"
                            ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                            : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                        }`}
                        onClick={() =>
                          !disableSubmit && !loading && onSubmit?.()
                        }
                        disabled={disableSubmit || loading}
                      >
                        {loading && (
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            ></path>
                          </svg>
                        )}
                        {submitLabel}
                      </button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default FormDialog;
