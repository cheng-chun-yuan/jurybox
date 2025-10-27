import { query, execute, transaction } from './client'
import type {
  Judge,
  Orchestrator,
  Agent,
  OrchestratorJudge,
  Evaluation,
  EvaluationJudgment,
} from './types'

// Judges Model
export const JudgesModel = {
  async findAll(): Promise<Judge[]> {
    return query<Judge>('SELECT * FROM judges WHERE status = ? ORDER BY rating DESC', ['active'])
  },

  async findById(id: number): Promise<Judge | null> {
    const results = await query<Judge>('SELECT * FROM judges WHERE id = ?', [id])
    return results[0] || null
  },

  async findByIds(ids: number[]): Promise<Judge[]> {
    if (ids.length === 0) return []
    const placeholders = ids.map(() => '?').join(',')
    return query<Judge>(`SELECT * FROM judges WHERE id IN (${placeholders})`, ids)
  },

  async create(judge: Omit<Judge, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const result = await execute(
      `INSERT INTO judges (
        name, title, tagline, description, avatar, theme_color,
        specialties, model_provider, model_name, system_prompt, temperature,
        price, wallet_address, payment_page_url, rating, total_judgments, ipfs_cid, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        judge.name,
        judge.title,
        judge.tagline,
        judge.description,
        judge.avatar,
        judge.theme_color,
        judge.specialties,
        judge.model_provider,
        judge.model_name,
        judge.system_prompt,
        judge.temperature,
        judge.price,
        judge.wallet_address,
        judge.payment_page_url,
        judge.rating,
        judge.total_judgments,
        judge.ipfs_cid,
        judge.status,
      ]
    )
    return result.insertId
  },

  async update(id: number, updates: Partial<Judge>): Promise<boolean> {
    const fields = Object.keys(updates)
      .filter((k) => k !== 'id' && k !== 'created_at' && k !== 'updated_at')
      .map((k) => `${k} = ?`)
      .join(', ')

    const values = Object.entries(updates)
      .filter(([k]) => k !== 'id' && k !== 'created_at' && k !== 'updated_at')
      .map(([, v]) => v)

    const result = await execute(`UPDATE judges SET ${fields} WHERE id = ?`, [...values, id])
    return result.affectedRows > 0
  },
}

// Orchestrators Model
export const OrchestratorsModel = {
  async findAll(): Promise<Orchestrator[]> {
    return query<Orchestrator>('SELECT * FROM orchestrators ORDER BY created_at DESC')
  },

  async findById(id: string): Promise<Orchestrator | null> {
    const results = await query<Orchestrator>('SELECT * FROM orchestrators WHERE id = ?', [id])
    return results[0] || null
  },

  async findByUserAddress(userAddress: string): Promise<Orchestrator[]> {
    return query<Orchestrator>('SELECT * FROM orchestrators WHERE user_address = ? ORDER BY created_at DESC', [
      userAddress,
    ])
  },

  async create(orchestrator: Omit<Orchestrator, 'created_at' | 'updated_at'>): Promise<string> {
    await execute(
      `INSERT INTO orchestrators (
        id, name, description, system_prompt, user_address, status,
        wallet_account_id, wallet_evm_address, wallet_private_key_encrypted, wallet_balance,
        max_discussion_rounds, round_timeout, consensus_algorithm, enable_discussion,
        convergence_threshold, outlier_detection, rounds_completed, rounds_total, rounds_current,
        hcs_topic_id, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orchestrator.id,
        orchestrator.name,
        orchestrator.description,
        orchestrator.system_prompt,
        orchestrator.user_address,
        orchestrator.status,
        orchestrator.wallet_account_id,
        orchestrator.wallet_evm_address,
        orchestrator.wallet_private_key_encrypted,
        orchestrator.wallet_balance,
        orchestrator.max_discussion_rounds,
        orchestrator.round_timeout,
        orchestrator.consensus_algorithm,
        orchestrator.enable_discussion,
        orchestrator.convergence_threshold,
        orchestrator.outlier_detection,
        orchestrator.rounds_completed,
        orchestrator.rounds_total,
        orchestrator.rounds_current,
        orchestrator.hcs_topic_id,
        orchestrator.metadata ? JSON.stringify(orchestrator.metadata) : null,
      ]
    )
    return orchestrator.id
  },

  async update(id: string, updates: Partial<Orchestrator>): Promise<boolean> {
    const fields: string[] = []
    const values: any[] = []

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
        fields.push(`${key} = ?`)
        values.push(key === 'metadata' && value ? JSON.stringify(value) : value)
      }
    })

    if (fields.length === 0) return false

    const result = await execute(`UPDATE orchestrators SET ${fields.join(', ')} WHERE id = ?`, [
      ...values,
      id,
    ])
    return result.affectedRows > 0
  },

  async delete(id: string): Promise<boolean> {
    const result = await execute('DELETE FROM orchestrators WHERE id = ?', [id])
    return result.affectedRows > 0
  },
}

// Agents Model
export const AgentsModel = {
  async findAll(): Promise<Agent[]> {
    return query<Agent>('SELECT * FROM agents ORDER BY created_at DESC')
  },

  async findById(id: string): Promise<Agent | null> {
    const results = await query<Agent>('SELECT * FROM agents WHERE id = ?', [id])
    return results[0] || null
  },

  async findByOrchestratorId(orchestratorId: string): Promise<Agent[]> {
    return query<Agent>('SELECT * FROM agents WHERE orchestrator_id = ? ORDER BY created_at ASC', [
      orchestratorId,
    ])
  },

  async create(agent: Omit<Agent, 'created_at' | 'updated_at'>): Promise<string> {
    await execute(
      `INSERT INTO agents (
        id, orchestrator_id, judge_id, name, role, status,
        agent_wallet_account_id, agent_wallet_evm_address,
        total_evaluations, average_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        agent.id,
        agent.orchestrator_id,
        agent.judge_id,
        agent.name,
        agent.role,
        agent.status,
        agent.agent_wallet_account_id,
        agent.agent_wallet_evm_address,
        agent.total_evaluations,
        agent.average_score,
      ]
    )
    return agent.id
  },

  async update(id: string, updates: Partial<Agent>): Promise<boolean> {
    const fields: string[] = []
    const values: any[] = []

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
        fields.push(`${key} = ?`)
        values.push(value)
      }
    })

    if (fields.length === 0) return false

    const result = await execute(`UPDATE agents SET ${fields.join(', ')} WHERE id = ?`, [...values, id])
    return result.affectedRows > 0
  },

  async delete(id: string): Promise<boolean> {
    const result = await execute('DELETE FROM agents WHERE id = ?', [id])
    return result.affectedRows > 0
  },
}

// Orchestrator Judges Model (Many-to-Many)
export const OrchestratorJudgesModel = {
  async findByOrchestratorId(orchestratorId: string): Promise<number[]> {
    const results = await query<{ judge_id: number }>(
      'SELECT judge_id FROM orchestrator_judges WHERE orchestrator_id = ?',
      [orchestratorId]
    )
    return results.map((r) => r.judge_id)
  },

  async addJudges(orchestratorId: string, judgeIds: number[]): Promise<void> {
    if (judgeIds.length === 0) return

    const values = judgeIds.map((judgeId) => [orchestratorId, judgeId])
    const placeholders = values.map(() => '(?, ?)').join(', ')

    await execute(
      `INSERT INTO orchestrator_judges (orchestrator_id, judge_id) VALUES ${placeholders}`,
      values.flat()
    )
  },

  async removeJudge(orchestratorId: string, judgeId: number): Promise<boolean> {
    const result = await execute(
      'DELETE FROM orchestrator_judges WHERE orchestrator_id = ? AND judge_id = ?',
      [orchestratorId, judgeId]
    )
    return result.affectedRows > 0
  },
}

// Evaluations Model
export const EvaluationsModel = {
  async findById(id: string): Promise<Evaluation | null> {
    const results = await query<Evaluation>('SELECT * FROM evaluations WHERE id = ?', [id])
    return results[0] || null
  },

  async findByOrchestratorId(orchestratorId: string): Promise<Evaluation[]> {
    return query<Evaluation>(
      'SELECT * FROM evaluations WHERE orchestrator_id = ? ORDER BY created_at DESC',
      [orchestratorId]
    )
  },

  async create(evaluation: Omit<Evaluation, 'created_at'>): Promise<string> {
    await execute(
      `INSERT INTO evaluations (
        id, orchestrator_id, content, criteria, consensus_score, confidence,
        variance, convergence_rounds, algorithm, status, hcs_topic_id,
        started_at, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        evaluation.id,
        evaluation.orchestrator_id,
        evaluation.content,
        evaluation.criteria,
        evaluation.consensus_score,
        evaluation.confidence,
        evaluation.variance,
        evaluation.convergence_rounds,
        evaluation.algorithm,
        evaluation.status,
        evaluation.hcs_topic_id,
        evaluation.started_at,
        evaluation.completed_at,
      ]
    )
    return evaluation.id
  },

  async update(id: string, updates: Partial<Evaluation>): Promise<boolean> {
    const fields: string[] = []
    const values: any[] = []

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = ?`)
        values.push(value)
      }
    })

    if (fields.length === 0) return false

    const result = await execute(`UPDATE evaluations SET ${fields.join(', ')} WHERE id = ?`, [
      ...values,
      id,
    ])
    return result.affectedRows > 0
  },
}

// Evaluation Judgments Model
export const EvaluationJudgmentsModel = {
  async findByEvaluationId(evaluationId: string): Promise<EvaluationJudgment[]> {
    return query<EvaluationJudgment>(
      'SELECT * FROM evaluation_judgments WHERE evaluation_id = ? ORDER BY round_number ASC, created_at ASC',
      [evaluationId]
    )
  },

  async create(
    judgment: Omit<EvaluationJudgment, 'id' | 'created_at'>
  ): Promise<number> {
    const result = await execute(
      `INSERT INTO evaluation_judgments (
        evaluation_id, judge_id, agent_id, score, initial_score, final_score,
        feedback, strengths, improvements, reasoning, round_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        judgment.evaluation_id,
        judgment.judge_id,
        judgment.agent_id,
        judgment.score,
        judgment.initial_score,
        judgment.final_score,
        judgment.feedback,
        judgment.strengths,
        judgment.improvements,
        judgment.reasoning,
        judgment.round_number,
      ]
    )
    return result.insertId
  },
}
