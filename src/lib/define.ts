import fetch from "node-fetch";

export default function define(word: string): Promise<string> {
    return new Promise((res, rej) => {
        fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + word)
            .then((r) => r.json())
            .then((r) => {
                let definition = r[0];
                if (!definition) {
                    return res('Unknown Word "' + word + '"');
                }
                res(
                    definition.word +
                        "\n**" +
                        definition.phonetic +
                        "**\n" +
                        definition.meanings
                            .map((m: any) => m.definitions[0].definition)
                            .join("\n")
                );
            });
    });
}
