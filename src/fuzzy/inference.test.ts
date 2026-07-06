import { computeCashback } from './inference';

describe('computeCashback - regras documentadas', () => {
  it('Ticket Médio + Engajamento Frequente => Cashback Padrão (~4%)', () => {
    // ticket=150 (pico de Médio, Baixo e Alto = 0) / engagement=50 (pico de Frequente, Iniciante e VIP = 0)
    const result = computeCashback(150, 50);

    expect(result.ticketMemberships.medio).toBe(1);
    expect(result.ticketMemberships.baixo).toBe(0);
    expect(result.ticketMemberships.alto).toBe(0);
    expect(result.engagementMemberships.frequente).toBe(1);

    expect(result.activatedRules).toHaveLength(1);
    expect(result.activatedRules[0]).toMatchObject({
      ticketSet: 'medio',
      engagementSet: 'frequente',
      outputSet: 'padrao',
      strength: 1,
    });

    expect(result.cashbackRate).toBeCloseTo(4, 1);
  });

  it('Ticket Alto + Engajamento VIP => Cashback Premium (6% a 10%)', () => {
    // ticket=350 (Alto pleno) / engagement=90 (VIP pleno)
    const result = computeCashback(350, 90);

    expect(result.ticketMemberships.alto).toBe(1);
    expect(result.engagementMemberships.vip).toBe(1);

    expect(result.activatedRules).toHaveLength(1);
    expect(result.activatedRules[0]).toMatchObject({
      ticketSet: 'alto',
      engagementSet: 'vip',
      outputSet: 'premium',
      strength: 1,
    });

    expect(result.cashbackRate).toBeGreaterThanOrEqual(6);
    expect(result.cashbackRate).toBeLessThanOrEqual(10);
  });

  it('Ticket Alto + Engajamento Iniciante => Cashback Padrão (~4%)', () => {
    // ticket=350 (Alto pleno) / engagement=10 (Iniciante pleno)
    const result = computeCashback(350, 10);

    expect(result.ticketMemberships.alto).toBe(1);
    expect(result.engagementMemberships.iniciante).toBe(1);

    expect(result.activatedRules).toHaveLength(1);
    expect(result.activatedRules[0]).toMatchObject({
      ticketSet: 'alto',
      engagementSet: 'iniciante',
      outputSet: 'padrao',
      strength: 1,
    });

    expect(result.cashbackRate).toBeCloseTo(4, 1);
  });
});

describe('computeCashback - fronteiras suaves', () => {
  it('R$100 é o cruzamento entre Baixo (caindo) e Médio (subindo)', () => {
    const result = computeCashback(100, 50);
    expect(result.ticketMemberships.baixo).toBe(0);
    expect(result.ticketMemberships.medio).toBeCloseTo(0.5);
  });

  it('R$200 é o cruzamento entre Médio (caindo) e Alto (subindo), ambos a 0.5', () => {
    const result = computeCashback(200, 50);
    expect(result.ticketMemberships.medio).toBeCloseTo(0.5);
    expect(result.ticketMemberships.alto).toBeCloseTo(0.5);
  });

  it('múltiplas regras podem ativar simultaneamente perto das fronteiras', () => {
    const result = computeCashback(200, 50);
    // Médio+Frequente->Padrão e Alto+Frequente->Premium ativam juntas, cada uma com força 0.5
    expect(result.activatedRules.length).toBeGreaterThanOrEqual(2);
    result.activatedRules.forEach(rule => {
      expect(rule.strength).toBeGreaterThan(0);
    });
    // resultado deve ficar entre o centro de Padrão (4) e o de Premium, refletindo a mistura
    expect(result.cashbackRate).toBeGreaterThan(4);
  });
});
