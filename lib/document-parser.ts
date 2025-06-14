/**
 * Bibliothèque pour parser différents types de documents
 * Dans une application réelle, vous utiliseriez des bibliothèques comme mammoth.js pour DOCX,
 * pdf.js pour PDF, etc.
 */

// Signatures de fichiers binaires courants pour la détection de format
const FILE_SIGNATURES = {
  PDF: new Uint8Array([0x25, 0x50, 0x44, 0x46]), // %PDF
  DOCX: new Uint8Array([0x50, 0x4b, 0x03, 0x04]), // PK..
  DOC: new Uint8Array([0xd0, 0xcf, 0x11, 0xe0]), // D0CF11E0
  ZIP: new Uint8Array([0x50, 0x4b, 0x03, 0x04]), // PK..
}

/**
 * Détecte le type de fichier basé sur les premiers octets
 */
function detectFileType(content: string | ArrayBuffer): string {
  // Si c'est déjà une chaîne, essayer de détecter si c'est du JSON ou du texte
  if (typeof content === "string") {
    try {
      JSON.parse(content)
      return "JSON"
    } catch (e) {
      return "TEXT"
    }
  }

  // Convertir en Uint8Array pour vérifier les signatures
  const bytes = new Uint8Array(content as ArrayBuffer)

  // Vérifier les signatures connues
  if (bytesMatch(bytes, FILE_SIGNATURES.PDF)) return "PDF"
  if (bytesMatch(bytes, FILE_SIGNATURES.DOCX)) return "DOCX"
  if (bytesMatch(bytes, FILE_SIGNATURES.DOC)) return "DOC"
  if (bytesMatch(bytes, FILE_SIGNATURES.ZIP)) return "ZIP"

  // Si aucune signature n'est reconnue, essayer de convertir en texte
  try {
    const decoder = new TextDecoder("utf-8")
    const text = decoder.decode(bytes)
    if (text.trim().length > 0) return "TEXT"
  } catch (e) {
    // Ignorer les erreurs de décodage
  }

  return "UNKNOWN"
}

/**
 * Compare les premiers octets d'un tableau avec une signature
 */
function bytesMatch(bytes: Uint8Array, signature: Uint8Array): boolean {
  if (bytes.length < signature.length) return false

  for (let i = 0; i < signature.length; i++) {
    if (bytes[i] !== signature[i]) return false
  }

  return true
}

/**
 * Parse un document texte simple
 */
function parseTextDocument(content: string): any {
  const lines = content.split("\n").filter((line) => line.trim() !== "")

  // Extraire le titre (première ligne non vide)
  const title = lines[0] || "Document sans titre"

  // Analyser le reste du contenu pour identifier les chapitres
  const chapters = []
  let currentChapter = null
  let currentContent = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()

    // Heuristique simple: une ligne courte suivie d'une ligne vide pourrait être un titre de chapitre
    const isChapterTitle = line.length < 100 && (i === lines.length - 1 || lines[i + 1].trim() === "")

    if (isChapterTitle) {
      // Si on avait déjà un chapitre en cours, le finaliser
      if (currentChapter) {
        chapters.push({
          title: currentChapter,
          content: currentContent.join("\n"),
        })
        currentContent = []
      }

      currentChapter = line
    } else if (currentChapter) {
      // Ajouter au contenu du chapitre en cours
      currentContent.push(line)
    } else {
      // Si on n'a pas encore de chapitre, créer un chapitre "Introduction"
      currentChapter = "Introduction"
      currentContent.push(line)
    }
  }

  // Ajouter le dernier chapitre s'il existe
  if (currentChapter) {
    chapters.push({
      title: currentChapter,
      content: currentContent.join("\n"),
    })
  }

  return {
    title,
    chapters,
  }
}

/**
 * Fonction principale pour parser un document
 */
export function parseDocument(content: string | ArrayBuffer): any {
  try {
    // Détecter le type de fichier
    const fileType = detectFileType(content)

    switch (fileType) {
      case "JSON":
        return JSON.parse(content as string)

      case "TEXT":
        return parseTextDocument(content as string)

      case "PDF":
        return {
          title: "Document PDF détecté",
          chapters: [
            {
              title: "Impossible de parser le PDF",
              content:
                "Le parsing de fichiers PDF nécessite une bibliothèque spécialisée comme pdf.js. Dans une application réelle, nous utiliserions cette bibliothèque pour extraire le texte du PDF.",
            },
          ],
        }

      case "DOCX":
        return {
          title: "Document DOCX détecté",
          chapters: [
            {
              title: "Impossible de parser le DOCX",
              content:
                "Le parsing de fichiers DOCX nécessite une bibliothèque spécialisée comme mammoth.js. Dans une application réelle, nous utiliserions cette bibliothèque pour convertir le DOCX en HTML ou en texte.",
            },
          ],
        }

      case "DOC":
        return {
          title: "Document DOC détecté",
          chapters: [
            {
              title: "Impossible de parser le DOC",
              content:
                "Le parsing de fichiers DOC (format binaire ancien de Microsoft Word) nécessite une bibliothèque spécialisée. Ce format est plus complexe à traiter que le format DOCX plus récent.",
            },
          ],
        }

      default:
        return {
          title: "Format de document non reconnu",
          chapters: [
            {
              title: "Format non supporté",
              content:
                "Le format de ce document n'a pas pu être identifié ou n'est pas supporté par le parseur actuel.",
            },
          ],
        }
    }
  } catch (error) {
    console.error("Erreur lors du parsing du document:", error)

    // Retourner un document minimal en cas d'erreur
    return {
      title: "Erreur de parsing",
      chapters: [
        {
          title: "Une erreur est survenue",
          content:
            "Le document n'a pas pu être parsé correctement. Veuillez vérifier le format du fichier et réessayer.",
        },
      ],
    }
  }
}
