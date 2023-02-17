export interface FlapsCommand {
    id: string;
    name: string;
    desc?: string;
    execute: Function;
}
