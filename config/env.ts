import {z} from "zod";

const envSchema = z.object({
    BACKEND_BASE_URL: z.string(),
    API_KEY: z.string()
})

const {data: envValues, error} = z.safeParse(envSchema, process.env);

if (error) {
    console.log("Envs not Provided!");
    process.exit(1)
}

export const envs = Object.freeze(envValues);