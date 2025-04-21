import type { BaseAlgorithm } from "../crypt/base";

export type StreamOptions<Algorithm extends BaseAlgorithm> = {
  algorithm: Algorithm;
  maxParallel?: number
};