import { v4 as uuidv4 } from "uuid";

export function generateCode(): string {
  return uuidv4();
}
