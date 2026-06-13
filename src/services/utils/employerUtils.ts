/**
 * Base URL for the employer/job finder frontend.
 * Set NEXT_PUBLIC_EMPLOYER_URL per environment:
 * - Local: http://localhost:3001
 * - Staging: https://staging.dcmzufv4tqp99.amplifyapp.com
 * - Prod: https://gothamenterprisesltd.com
 */
const EMPLOYER_BASE_URL = process.env.NEXT_PUBLIC_JOBFINDER_URL || "https://gothamenterprisesltd.com";

/**
 * Returns the full URL to view a job posting on the employer frontend.
 */
export function getEmployerJobUrl(jobId: string): string {
  const base = EMPLOYER_BASE_URL.replace(/\/$/, "");
  return `${base}/find-jobs/occupation/${jobId}/slug`;
}
