import fetch from "node-fetch";

export default async function define(word: string): Promise<string> {
    let response = await fetch(
        "https://api.dictionaryapi.dev/api/v2/entries/en/" + word
    ).then((r) => r.json());
    let definition = response[0];
    if (!definition) return `Unknown word ${word}`;
    let meanings = definition.meanings.map(
        (m: any) => m.definitions[0].definition
    );
    return `${definition.word}\n**${definition.phonetic}**\n${meanings.join(
        "\n"
    )}`;
}
