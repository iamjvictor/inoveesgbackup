# Modelo de Cálculo Automático \- Pré-Diagnóstico ESG Bioeconômico

# **1\. Objetivo**

Definir a lógica de cálculo automático para geração do nível de maturidade ESG Bioeconômico a partir das respostas do questionário.

RESPOSTAS DAS PERGUNTAS DE CADA PILAR:

**Inexistente** (A prática não existe ou nunca foi considerada)  
**Inicial**	(Existem iniciativas pontuais ou informais, sem padronização)  
**Parcialmente Implementado** (A prática ocorre em parte da empresa e possui algum acompanhamento)  
**Estruturado**	(A prática é formalizada, monitorada e aplicada de forma consistente)  
**Avançado / Estratégico** (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)

**Estrutura Metodológica do Diagnóstico ESG Bioeconômico**

**1\. Estrutura Geral do Diagnóstico**

O diagnóstico é dividido em 4 pilares:

| Pilar | Quantidade de Perguntas |
| :---- | ----- |
| Ambiental (E) | 17 |
| Bioeconomia Circular (EB) | 14 |
| Social (S) | 21 |
| Governança (G) | 23 |

Total: **75 perguntas**

**2\. Modelo de Respostas**

Cada pergunta possui 5 opções objetivas de resposta, representando o nível de maturidade da empresa.

| Pontuação | Interpretação |
| ----- | :---- |
| 1 | Não existe ou não atende |
| 2 | Existe de forma informal ou incompleta |
| 3 | Existe de forma estruturada |
| 4 | Implementado com monitoramento |
| 5 | Implementado, monitorado e com melhoria contínua |

O sistema converte automaticamente a resposta selecionada em uma pontuação numérica de 1 a 5\.

**3\. Sistema de Pesos**

As perguntas possuem pesos diferentes conforme o nível de complexidade ou relevância estratégica.

| Tipo de Critério | Peso |
| :---- | ----- |
| Critérios básicos (Nível 0\) | 0,5 |
| Critérios intermediários e avançados (Níveis 3 a 5\) | 1,0 |

O peso serve para reduzir a influência de critérios mais simples e aumentar a relevância de práticas mais estruturadas.

**4\. Cálculo da Pontuação por Pergunta**

Cada pergunta gera um score ponderado.

Fórmula:

Score da Pergunta\=RespostaPeso

**Exemplo:**

* Resposta escolhida: 4 

* Peso da pergunta: 0,5 

Resultado: 4 x 0,5 \=2.0

**5\. Cálculo da Média de Cada Pilar**

O sistema soma todos os scores ponderados do pilar e divide pela soma total dos pesos daquele pilar.

Fórmula: Meˊdia do Pilar\=∑(RespostaPeso)∑Pesos

O resultado final de cada pilar sempre ficará entre 1 e 5\.

**6\. Cálculo Final ESG Bioeconômico**

O score final considera pesos diferentes para cada dimensão estratégica.

**Distribuição de pesos:**

* Ambiental \+ Bioeconomia Circular \= 40% 

* Social \= 30% 

* Governança \= 30% 

Fórmula:

ESG Final\=0.4+(S×0.3)+(G×0.3)

Onde:

* E \= média Ambiental 

* EB \= média Bioeconomia Circular 

* S \= média Social 

* G \= média Governança

**7\. Classificação de Maturidade**

Após o cálculo final, o sistema classifica automaticamente a organização em um nível de maturidade ESG.

| Faixa | Nível |
| ----- | :---- |
| 1,0 – 1,9 | Nível 1 — Elementar |
| 2,0 – 2,9 | Nível 2 — Não Integrado |
| 3,0 – 3,9 | Nível 3 — Gerencial |
| 4,0 – 4,4 | Nível 4 — Estratégico |
| 4,5 – 5,0 | Nível 5 — Transformador |

**8\. Regras para Pré-Diagnóstico**

Quando o diagnóstico for realizado sem auditoria documental ou validação técnica:

* A pontuação máxima será limitada a 4,0 

* O resultado será classificado como “Declaratório” 

* O nível de confiança será identificado como “Baixo” 

Isso evita superavaliações sem evidências verificáveis.

