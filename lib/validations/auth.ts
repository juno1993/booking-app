import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
})

export const signUpSchema = loginSchema.extend({
  name: z.string().min(1, '이름을 입력해주세요').max(50),
  phone: z.string().min(10, '올바른 전화번호를 입력해주세요').max(20).regex(/^[0-9-]+$/, '숫자와 하이픈만 입력 가능합니다'),
})

export type LoginSchemaType = z.infer<typeof loginSchema>
export type SignUpSchemaType = z.infer<typeof signUpSchema>
