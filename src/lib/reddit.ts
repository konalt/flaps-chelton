import { RedditListing, RedditPost } from "../types";
import fetch from "node-fetch";

export function get100Posts(subreddit: string): Promise<RedditPost[]> {
    return new Promise((res, rej) => {
        fetch("https://www.reddit.com/r/" + subreddit + "/.json?limit=100")
            .then((r) => r.json())
            .then((r: RedditListing) => {
                res(r.data.children);
            });
    });
}
