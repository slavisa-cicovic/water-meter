import { AiFaqRepository } from "src/repositories/aiFaqRepository";
import { AiFaqCreateInput, AiFaqUpdateInput } from "src/types/aiFaq";
import { validateAiFaqCreate, validateAiFaqUpdate } from "src/validation/aiFaq";

type ServiceResult<T> = { success: true; data: T } | { success: false; error: string; details?: Record<string, string[]> };

export const AiFaqService = {
  async listAll(): Promise<ServiceResult<{ entries: Array<{ id: string; question: string; answer: string; isActive: boolean; updatedAt: string }> }>> {
    const entries = await AiFaqRepository.listAll();
    return {
      success: true,
      data: {
        entries: entries.map((entry) => ({
          ...entry,
          updatedAt: entry.updatedAt.toISOString(),
        })),
      },
    };
  },

  async create(input: AiFaqCreateInput): Promise<ServiceResult<{ entryId: string }>> {
    const validation = validateAiFaqCreate(input);
    if (!validation.valid) {
      return { success: false, error: "VALIDATION_FAILED", details: validation.errors };
    }
    const entry = await AiFaqRepository.create(input);
    return { success: true, data: { entryId: entry.id } };
  },

  async update(input: AiFaqUpdateInput): Promise<ServiceResult<{ entryId: string }>> {
    const validation = validateAiFaqUpdate(input);
    if (!validation.valid) {
      return { success: false, error: "VALIDATION_FAILED", details: validation.errors };
    }
    const entry = await AiFaqRepository.update(input);
    return { success: true, data: { entryId: entry.id } };
  },
};
