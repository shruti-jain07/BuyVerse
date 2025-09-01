import z from 'zod';

export const registerSchema=z.object({
            email:z.string().email(),//changed for test:string().email()
            password:z.string().min(6),
            username:z
            .string()
            .min(2,"Username must be of atleast 2 Characters")
            .max(50,"Username must be less than 50 characters")
            .regex(
               /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
               "Username can only contain lowercase letters, numbers and hyphen (-) and must be start or ended with a letter or number"
            )
           .refine(
            (val)=>!val.includes("--"),
            "Username cannot contain double consecutive hyphens."
           )
           .transform((val)=>val.toLowerCase()),
        });

   export const loginSchema= z.object({
               email:z.string().email(),
               password:z.string(),
           })