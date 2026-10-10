export type AppErrorCode = "DATABASE_UNAVAILABLE" | string;

export function getErrorModalCopy(code?: AppErrorCode) {
  if (code === "DATABASE_UNAVAILABLE") {
    return {
      title: "Serviço temporariamente indisponível",
      message: "Não foi possível comunicar com o servidor agora. Tente novamente em instantes.",
      retryLabel: "Tentar novamente",
    };
  }

  return {
    title: "Não foi possível concluir a operação",
    message: "Ocorreu um erro inesperado. Tente novamente.",
    retryLabel: "Tentar novamente",
  };
}
