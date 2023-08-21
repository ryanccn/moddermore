export interface ModPwToml {
  /** The name of the mod, which can be displayed in user interfaces to identify the mod. It does not need to be unique between mods, although this may cause confusion. */
  name: string;

  /** A relative path using forward slashes. Must not reference a file outside the pack root, and should not include characters or filenames restricted on common operating systems. */
  filename: string;

  /** A physical Minecraft side. Server applies to the dedicated server, client applies to the client (and integrated server), and both applies to every installation. Possible values are: `both`, `client`, `server`. */
  side?: "both" | "client" | "server";

  /** Information about how to download this mod. */
  download: {
    /** A hashing format used to detect if a file has changed. You may use your own hash format, but the valid values here should be supported and expected for most packs, especially SHA-256 and Murmur2. Possible values are: `md5`, `murmur2`, `sha1`, `sha256`, `sha512`. */
    "hash-format"?: "md5" | "murmur2" | "sha1" | "sha256" | "sha512";

    /** The hash of the specified file, as a string. Binary hashes should be stored as hexadecimal, and case should be ignored during parsing. Numeric hashes (e.g. Murmur2) should still be stored as a string, to ensure the value is preserved correctly. */
    hash?: string;

    /** A URI reference compliant to RFC 2396; specifically RFC 2396 amended by RFC 2732 for IPv6 support. This ensures compatibility with older URI parsers that do not support RFC 3986 - if your URI implementation complies with RFC 3986 make sure that it correctly encodes [ and ] to %5B and %5D respectively. */
    url?: string;

    /** This is cursed */
    mode?: "metadata:curseforge";
  };

  /** Information about the optional state of this mod. When excluded, this indicates that the mod is not optional. */
  option?: {
    /** Whether or not the mod is optional. This can be set to false if you want to keep the description but make the mod required. */
    optional: boolean;

    /** If true, the mod will be enabled by default. If false, the mod will be disabled by default. If omitted, will behave as if false was set. If a pack format does not support optional mods but it does support disabling mods, the mod will be disabled if it defaults to being disabled. */
    default?: boolean;

    /** A description displayed to the user when they select optional mods. This should explain why or why not the user should enable the mod. */
    description?: boolean;
  };

  /** Information about how to update the download details of this mod with tools. The information stored is specific to the update interface. */
  update?: {
    /** An update value for updating mods downloaded from CurseForge. */
    curseforge?: { "project-id": string | number; "file-id": string | number };

    /** An update value for updating mods downloaded from Modrinth. */
    modrinth?: { "mod-id": string; version: string };
  };
}
