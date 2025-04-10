export function extractBaseDomain(
  urlString: string | null | undefined
): string {
  if (!urlString || typeof urlString !== "string") {
    return "Desconhecido";
  }

  try {
    let effectiveUrl = urlString.includes("://")
      ? urlString
      : `http://${urlString}`;

    if (!effectiveUrl.startsWith("http") && effectiveUrl.includes("://")) {
      const schemeParts = effectiveUrl.split("://");
      if (schemeParts.length > 1 && schemeParts[1].includes(".")) {
        effectiveUrl = `http://${schemeParts[1]}`;
      } else if (schemeParts.length > 1) {
        return schemeParts[1] || "Desconhecido";
      }
    }

    const url = new URL(effectiveUrl);
    let domain = url.hostname;

    if (!domain) {
      const pathParts = url.pathname.split("/")[0];
      if (pathParts.includes(".")) {
        domain = pathParts;
      } else if (url.protocol !== "http:" && url.protocol !== "https:") {
        return urlString.replace(/^[^:]+:\/\//, "") || "Desconhecido";
      } else {
        return "Desconhecido";
      }
    }

    domain = domain.split(":")[0].toLowerCase();

    if (domain.startsWith("www.")) {
      domain = domain.substring(4);
    }

    const parts = domain.split(".");
    if (parts.length > 2) {
      const slds = [
        "co",
        "com",
        "org",
        "gov",
        "net",
        "ac",
        "edu",
        "ne",
        "or",
        "go",
      ];
      const isCommonSLD = slds.includes(parts[parts.length - 2]);
      const isCommonCcTLD = parts[parts.length - 1].length === 2;

      if (isCommonSLD && isCommonCcTLD) {
        return parts.slice(-3).join(".");
      } else {
        return parts.slice(-2).join(".");
      }
    } else if (parts.length <= 2 && domain) {
      return domain;
    }

    return "Desconhecido";
  } catch {
    if (urlString.includes(".")) {
      let cleaned = urlString.split("/")[0].split(":")[0].toLowerCase();
      if (cleaned.startsWith("www.")) {
        cleaned = cleaned.substring(4);
      }
      return cleaned || "Desconhecido";
    }
    return "Desconhecido";
  }
}
