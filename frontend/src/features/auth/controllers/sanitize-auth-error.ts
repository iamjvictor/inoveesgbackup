export function sanitizeAuthError(message: string, context: "login" | "adminLogin" | "register"): string {
  if (!message) {
    if (context === "register") return "Ocorreu um erro no cadastro. Tente novamente.";
    if (context === "adminLogin") return "Não foi possível realizar o login administrativo.";
    return "Não foi possível realizar o login. Tente novamente mais tarde.";
  }

  // Tentativa de extrair mensagem específica do Zod em formato JSON
  try {
    if (message.includes("[") && message.includes("message")) {
      const parsed = JSON.parse(message);
      if (Array.isArray(parsed) && parsed[0]?.message) {
        return parsed[0].message;
      }
    }
  } catch {
    /* fallback */
  }

  const lower = message.toLowerCase();

  // 1. Erros de Resposta HTML / Parsing JSON / SyntaxError (ex: servidor responde 404/500/502 com página HTML)
  if (
    lower.includes("unexpected token") ||
    lower.includes("<!doctype") ||
    lower.includes("doctype") ||
    lower.includes("is not valid json") ||
    lower.includes("not valid json") ||
    lower.includes("syntaxerror") ||
    lower.includes("json.parse") ||
    lower.includes("<html") ||
    lower.includes("<head") ||
    lower.includes("<body") ||
    lower.includes("<pre") ||
    lower.includes("cannot post") ||
    lower.includes("cannot get")
  ) {
    if (context === "register") {
      return "Erro de comunicação com o servidor. Tente novamente em alguns instantes.";
    }
    if (context === "adminLogin") {
      return "Não foi possível conectar ao serviço de autenticação administrativa.";
    }
    return "Serviço temporariamente indisponível. Verifique se o servidor está ativo e tente novamente.";
  }

  // 2. Falhas de Rede e Conexão
  if (
    lower.includes("fetch failed") ||
    lower.includes("failed to fetch") ||
    lower.includes("failed to load resource") ||
    lower.includes("networkerror") ||
    lower.includes("econnrefused") ||
    lower.includes("connection refused")
  ) {
    return "Não foi possível conectar ao servidor. Tente novamente mais tarde.";
  }

  // 3. Erros de Banco de Dados / Prisma / Código Interno (Vazamento de Schema/Stack Trace)
  if (
    lower.includes("prisma") ||
    lower.includes("findunique") ||
    lower.includes("findfirst") ||
    lower.includes("findmany") ||
    lower.includes("database") ||
    lower.includes("table") ||
    lower.includes("column") ||
    lower.includes("invocation") ||
    lower.includes("internal server error") ||
    lower.includes("unexpected error") ||
    lower.includes("typeerror") ||
    lower.includes("uncaught") ||
    lower.includes("sql") ||
    lower.includes(".ts:") ||
    lower.includes(".js:") ||
    lower.includes("/home/") ||
    lower.includes("/app/")
  ) {
    if (context === "register") {
      return "Erro interno ao processar seu cadastro. Tente novamente em alguns instantes.";
    }
    return "Ocorreu um erro interno. Tente novamente em alguns instantes.";
  }

  // 4. Status HTTP Não Encontrado (404) ou Gateway (502/503/504)
  if (lower.includes("404") || lower.includes("not found")) {
    return "Serviço temporariamente indisponível (404). Tente novamente mais tarde.";
  }

  if (
    lower.includes("502") ||
    lower.includes("503") ||
    lower.includes("504") ||
    lower.includes("bad gateway") ||
    lower.includes("gateway timeout")
  ) {
    return "Servidor temporariamente indisponível. Tente novamente em instantes.";
  }

  // 5. Configuração de Chave API
  if (lower.includes("invalid api key")) {
    return "Erro na configuração do serviço de autenticação.";
  }

  // 6. E-mail/CPF/CNPJ já cadastrado (Específico de Cadastro)
  if (context === "register") {
    if (
      lower.includes("user already exists") ||
      lower.includes("already registered") ||
      lower.includes("email address already registered") ||
      lower.includes("já está cadastrado")
    ) {
      return message.includes("já está cadastrado") ? message : "Este e-mail já está cadastrado.";
    }
  }

  // 7. Restrição de Admin
  if (lower.includes("acesso restrito ao painel administrativo")) {
    return "Acesso restrito ao painel administrativo";
  }

  // 8. Credenciais de Login Incorretas
  if (
    lower === "unauthorized" ||
    lower.includes("401") ||
    lower.includes("invalid login credentials") ||
    lower.includes("invalid credentials") ||
    lower.includes("e-mail ou senha incorretos") ||
    lower.includes("usuário não encontrado")
  ) {
    if (context === "adminLogin") {
      return "Acesso restrito ou credenciais incorretas";
    }
    return "E-mail ou senha incorretos";
  }

  // 9. Erros de Validação dos Campos
  if (lower.includes("[") || lower.includes("validation") || lower.includes("code")) {
    if (context === "register") {
      return "Verifique se todos os campos foram preenchidos corretamente";
    }
    return "E-mail ou senha inválidos";
  }

  // 10. Mensagem limpa enviada pelo backend sem código/HTML/JSON
  if (
    message.length < 120 &&
    !message.includes("{") &&
    !message.includes("}") &&
    !message.includes("<") &&
    !message.includes(">") &&
    !message.includes("-->") &&
    !message.includes("\n") &&
    !lower.includes("token")
  ) {
    return message;
  }

  return context === "register"
    ? "Ocorreu um erro no cadastro. Tente novamente."
    : "Não foi possível realizar o login. Tente novamente mais tarde.";
}
