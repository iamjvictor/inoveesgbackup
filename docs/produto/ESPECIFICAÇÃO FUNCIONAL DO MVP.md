**ESPECIFICAÇÃO FUNCIONAL DO MVP**

**Cálculo do Pré-Diagnóstico ESG Bioeconômico – Inove ESG**

**Objetivo**

Calcular automaticamente o nível de maturidade ESG Bioeconômica da organização a partir das respostas do questionário.

O questionário possui **75 perguntas**, distribuídas em quatro pilares:

* Ambiental (17 perguntas)  
* Bioeconomia Circular (14 perguntas)  
* Social (21 perguntas)  
* Governança (23 perguntas)

Cada pergunta possui:

* uma resposta (valor de 1 a 5);  
* um peso previamente cadastrado no sistema.

**PASSO 1 – Converter a resposta em valor numérico**

Cada alternativa corresponde a um valor.

| Resposta | Valor |
| ----- | :---: |
| Inexistente | 1 |
| Inicial | 2 |
| Parcialmente Implementado | 3 |
| Estruturado | 4 |
| Avançado / Estratégico | 5 |

**PASSO 2 – Calcular a pontuação da pergunta**

Para cada pergunta respondida:

**Pontuação da Pergunta \= Valor da Resposta × Peso da Pergunta**

**Exemplo**

Pergunta E01  
Resposta escolhida: Estruturado  
Valor: 4  
Peso: 1,50  
Resultado: 4 × 1,50 \= **6,00**  
Este cálculo deve ser realizado para todas as 75 perguntas.

**PASSO 3 – Calcular a nota de cada Pilar**

Para cada pilar:

**1\. Somar todas as pontuações das perguntas daquele pilar.**

Exemplo:

Pontuação das perguntas do Pilar Ambiental  
6,00  
5,00  
4,50  
...  
Total \= **82,50**

**2\. Somar todos os pesos das perguntas daquele pilar.**

Exemplo:

Peso total do Pilar Ambiental  
1,50  
1,25  
1,50  
...  
Total \= **21,75**

**3\. Dividir**

**Nota do Pilar \= Soma das Pontuações ÷ Soma dos Pesos**

Exemplo

82,50 ÷ 21,75 \= **3,79**

O resultado da nota do pilar sempre ficará entre **1,00 e 5,00**.

O mesmo procedimento deverá ser realizado para:

* Ambiental  
* Bioeconomia Circular  
* Social  
* Governança

**PASSO 4 – Calcular a Nota Final**

Após calcular as quatro notas dos pilares, calcular a média simples.

**Nota Final \= (Ambiental \+ Bioeconomia \+ Social \+ Governança) ÷ 4**

Exemplo

Ambiental \= 3,79  
Bioeconomia \= 4,10  
Social \= 3,55  
Governança \= 4,20

Nota Final: (3,79 \+ 4,10 \+ 3,55 \+ 4,20) ÷ 4 Resultado: **3,91**

**PASSO 5 – Converter a Nota Final em Percentual**

Para facilitar a visualização dos resultados na plataforma, converter a nota final em percentual.

**Percentual \= (Nota Final ÷ 5\) × 100**

Exemplo  
Nota Final \= 3,91  
Percentual  
(3,91 ÷ 5\) × 100  
Resultado:  
**78%**  
O mesmo cálculo deverá ser realizado para cada um dos quatro pilares.

Exemplo

| Pilar | Nota | Percentual |
| ----- | ----: | ----: |
| Ambiental | 3,79 | 76% |
| Bioeconomia Circular | 4,10 | 82% |
| Social | 3,55 | 71% |
| Governança | 4,20 | 84% |
| Resultado Geral | 3,91 | 78% |

Esses percentuais serão utilizados para alimentar os indicadores gráficos da plataforma (termômetros, barras de progresso ou medidores).

**PASSO 6 – Classificação Automática**

Após calcular a Nota Final, classificar automaticamente a empresa.

| Nota Final | Percentual | Classificação |
| :---: | :---: | :---: |
| 1,00 – 1,99 | 20% – 39% | Nível 1 – Elementar |
| 2,00 – 2,99 | 40% – 59% | Nível 2 – Engajado |
| 3,00 – 3,99 | 60% – 79% | Nível 3 – Implementador |
| 4,00 – 4,49 | 80% – 89% | Nível 4 – Avançado |
| 4,50 – 5,00 | 90% – 100% | Nível 5 – Transformador |

**Resultado esperado na Plataforma**

Ao finalizar o questionário, o sistema deverá apresentar:

* Percentual do Pilar Ambiental;  
* Percentual do Pilar Bioeconomia Circular;  
* Percentual do Pilar Social;  
* Percentual do Pilar Governança;  
* Percentual Geral ESG Bioeconômico;  
* Nota Final (escala de 1,00 a 5,00);  
* Classificação automática de maturidade.

Esses resultados deverão ser apresentados de forma visual, utilizando indicadores gráficos em formato de termômetro ou medidor vertical, com gradação de cores do vermelho ao verde, indicando a evolução da maturidade ESG Bioeconômica.

**Escala visual sugerida**

| Percentual | Cor predominante |
| :---: | :---: |
| 0% – 19% | Vermelho |
| 20% – 39% | Laranja |
| 40% – 59% | Amarelo |
| 60% – 79% | Verde-claro |
| 80% – 100% | Verde |

Exemplo:

**Resultado Geral ESG Bioeconômico**

**78%**

**Nível 3 – Implementador**

O mesmo padrão visual deverá ser utilizado para os quatro pilares, permitindo que o usuário identifique rapidamente seus pontos fortes e as oportunidades de melhoria.

![][image1]

**MATRIZ DE PESOS – PILAR AMBIENTAL**

| ID | Pergunta | Tema | O que avalia | Categoria | Peso |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **E01** | A empresa possui licenças ambientais válidas? | Conformidade Legal | Atendimento à legislação ambiental e regularidade operacional. | **Essencial** | **1,50** |
| **E02** | Existe controle de consumo de água e energia? | Gestão de Recursos | Monitoramento sistemático do consumo de recursos naturais. | Estratégica | **1,25** |
| **E03** | A empresa separa resíduos e destina corretamente resíduos perigosos? | Gestão de Resíduos | Conformidade ambiental e gerenciamento adequado de resíduos. | **Essencial** | **1,50** |
| **E04** | Plano formal de gestão de resíduos? | Economia Circular | Estruturação da gestão de resíduos com foco em redução, reutilização e reciclagem. | Estratégica | **1,25** |
| **E05** | Metas de redução de resíduos? | Gestão por Indicadores | Existência de metas, indicadores e acompanhamento contínuo. | Diferencial | **1,00** |
| **E06** | Programas de educação sobre resíduos? | Educação Ambiental | Capacitação de colaboradores e fornecedores em práticas ambientais. | Complementar | **0,75** |
| **E07** | Monitora e reduz consumo de água? | Eficiência Hídrica | Gestão eficiente do recurso hídrico. | Estratégica | **1,25** |
| **E08** | Tecnologias de reuso de água? | Inovação Ambiental | Implementação de soluções para reuso e economia hídrica. | Diferencial | **1,00** |
| **E09** | Avalia riscos de escassez hídrica? | Gestão de Riscos Climáticos | Capacidade de antecipar impactos sobre a disponibilidade de água. | Estratégica | **1,25** |
| **E10** | Fontes de energia e renováveis? | Transição Energética | Diversificação da matriz energética e uso de fontes renováveis. | Estratégica | **1,25** |
| **E11** | Plano de transição energética? | Planejamento Climático | Existência de metas para ampliação do uso de energia renovável. | Diferencial | **1,00** |
| **E12** | Proteção da biodiversidade? | Biodiversidade | Ações de conservação e restauração ambiental. | Estratégica | **1,25** |
| **E13** | Avaliação de impacto na biodiversidade? | Licenciamento Ambiental | Avaliação prévia dos impactos ambientais de projetos. | **Essencial** | **1,50** |
| **E14** | Seleção de fornecedores comprometidos com biodiversidade? | Cadeia Sustentável | Critérios ambientais aplicados à cadeia de suprimentos. | Diferencial | **1,00** |
| **E15** | Mede e reporta emissões de GEE? | Mudanças Climáticas | Inventário e monitoramento das emissões de carbono. | **Essencial** | **1,50** |
| **E16** | Plano de descarbonização? | Estratégia Climática | Planejamento para redução de emissões de curto, médio e longo prazo. | **Essencial** | **1,50** |
| **E17** | Engaja a cadeia de valor na redução das emissões (Escopo 3)? | Cadeia de Valor | Gestão colaborativa das emissões indiretas. | Estratégica | **1,25** |

**Justificativa Técnica dos Pesos do Pilar Ambiental (E)**

A definição dos pesos do Pilar Ambiental foi baseada na materialidade ambiental, na criticidade para a conformidade legal, no potencial de mitigação dos impactos ambientais e na capacidade da empresa em gerenciar riscos climáticos e uso eficiente dos recursos naturais.

Foram considerados como referência conceitual os princípios da ABNT PR 2030, as diretrizes da Global Reporting Initiative, os temas materiais da Sustainability Accounting Standards Board e boas práticas internacionais de gestão ambiental.

**Peso 1,50 – Essencial**

Foram classificados como Essenciais os critérios cuja ausência representa riscos elevados para a conformidade legal, para a continuidade das operações e para a gestão ambiental da organização.

Esses critérios constituem a base mínima esperada para uma empresa comprometida com práticas ESG.

Incluem:

* Regularidade das licenças ambientais; 

* Gestão adequada de resíduos perigosos; 

* Avaliação de impactos sobre a biodiversidade; 

* Inventário e monitoramento das emissões de gases de efeito estufa (GEE); 

* Existência de plano formal de descarbonização. 

Esses elementos possuem elevada relevância porque estão diretamente relacionados ao cumprimento da legislação ambiental, à prevenção de passivos ambientais, à mitigação das mudanças climáticas e à redução dos riscos operacionais e reputacionais.

**Peso 1,25 – Estratégica**

Foram classificados como Estratégicos os critérios que demonstram uma gestão ambiental estruturada e orientada para melhoria contínua.

Incluem:

* Controle do consumo de água e energia; 

* Gestão integrada de resíduos; 

* Monitoramento da eficiência hídrica; 

* Avaliação dos riscos de escassez de água; 

* Gestão da matriz energética; 

* Proteção da biodiversidade; 

* Engajamento da cadeia de valor na redução das emissões (Escopo 3). 

Esses critérios refletem organizações que ultrapassam o atendimento às exigências legais e incorporam práticas sistemáticas de gestão ambiental e eficiência operacional.

**Peso 1,00 – Diferencial**

Foram classificados como Diferenciais os critérios relacionados à inovação e ao aperfeiçoamento contínuo das práticas ambientais.

Incluem:

* Definição de metas para redução de resíduos; 

* Implantação de tecnologias para reuso de água; 

* Planejamento da transição energética; 

* Seleção de fornecedores comprometidos com a conservação da biodiversidade. 

Essas práticas evidenciam um estágio mais avançado de maturidade ambiental e contribuem para aumentar a resiliência e a competitividade da organização.

**Peso 0,75 – Complementar**

Foi classificada como Complementar a prática relacionada à educação e conscientização ambiental.

Inclui:

* Programas de educação ambiental voltados para colaboradores e fornecedores. 

Embora essa prática fortaleça a cultura organizacional e favoreça a melhoria contínua, seus resultados dependem da existência prévia de sistemas formais de gestão ambiental. Por esse motivo, sua influência no cálculo da maturidade é menor quando comparada aos critérios estratégicos e essenciais.

**MATRIZ DE PESOS – PILAR BIOECONOMIA CIRCULAR (EB)**

| ID | Pergunta | Tema | O que avalia | Categoria | Peso |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **EB01** | A empresa utiliza matérias-primas renováveis, recicladas ou de origem sustentável? | Matérias-primas Sustentáveis | O grau de utilização de insumos provenientes de fontes renováveis, recicladas ou certificadas, reduzindo a dependência de recursos fósseis e não renováveis. | **Essencial** | **1,50** |
| **EB02** | A empresa possui critérios para seleção de fornecedores de matérias-primas sustentáveis? | Cadeia de Suprimentos Sustentável | Integração de critérios ambientais na aquisição de insumos e fortalecimento da cadeia sustentável. | Estratégica | **1,25** |
| **EB03** | A empresa adota princípios de economia circular no desenvolvimento de produtos ou processos? | Economia Circular | Aplicação prática dos princípios de redução, reutilização, reciclagem e regeneração de recursos. | **Essencial** | **1,50** |
| **EB04** | Os produtos ou serviços são projetados considerando reutilização, reciclagem ou maior vida útil? | Ecodesign | Incorporação do conceito de ciclo de vida e circularidade desde o desenvolvimento dos produtos. | Estratégica | **1,25** |
| **EB05** | Existe logística reversa para produtos ou embalagens? | Logística Reversa | Estrutura para retorno, reaproveitamento ou destinação ambientalmente adequada de produtos e embalagens. | Estratégica | **1,25** |
| **EB06** | A empresa mede indicadores relacionados à circularidade dos materiais? | Indicadores de Circularidade | Monitoramento da eficiência no uso dos recursos e dos fluxos circulares de materiais. | Diferencial | **1,00** |
| **EB07** | A empresa utiliza bioinsumos, biomateriais ou biotecnologias sustentáveis? | Bioeconomia | Aplicação de soluções baseadas em recursos biológicos e inovação sustentável. | **Essencial** | **1,50** |
| **EB08** | Existe incentivo à inovação voltada para produtos ou processos bioeconômicos? | Inovação | Capacidade da empresa em desenvolver soluções inovadoras relacionadas à bioeconomia. | Estratégica | **1,25** |
| **EB09** | A empresa realiza Avaliação do Ciclo de Vida (ACV) de produtos ou processos? | Avaliação do Ciclo de Vida | Medição dos impactos ambientais ao longo de todo o ciclo de vida do produto. | Estratégica | **1,25** |
| **EB10** | A empresa possui indicadores para redução do consumo de matérias-primas virgens? | Eficiência de Recursos | Gestão da substituição de recursos naturais por alternativas renováveis ou recicladas. | Diferencial | **1,00** |
| **EB11** | Existe cooperação com universidades, startups ou centros de pesquisa para inovação em bioeconomia? | Ecossistema de Inovação | Integração da empresa com ambientes de inovação e desenvolvimento tecnológico. | Diferencial | **1,00** |
| **EB12** | A empresa comunica aos clientes os benefícios ambientais de seus produtos ou serviços? | Comunicação ESG | Transparência sobre atributos ambientais e geração de valor sustentável. | Complementar | **0,75** |
| **EB13** | A empresa acompanha indicadores relacionados aos Objetivos de Desenvolvimento Sustentável (ODS) associados à bioeconomia? | ODS e Bioeconomia | Alinhamento estratégico às agendas globais de desenvolvimento sustentável. | Estratégica | **1,25** |
| **EB14** | Existe estratégia formal para ampliar a participação da bioeconomia no modelo de negócios? | Estratégia Bioeconômica | Integração da bioeconomia ao planejamento estratégico da organização. | **Essencial** |  |

**Justificativa técnica dos pesos do Pilar Bioeconomia Circular**  
A lógica adotada foi:  
**Peso 1,50 — Essencial**  
Critérios que representam a essência da bioeconomia e da transição para modelos produtivos sustentáveis.  
Exemplos:

* utilização de biomateriais;   
* economia circular;   
* estratégia bioeconômica;   
* matérias-primas renováveis. 

Sem esses elementos, dificilmente a empresa pode ser considerada madura em bioeconomia.

**Peso 1,25 — Estratégica**  
Práticas que consolidam a gestão bioeconômica:

* logística reversa;   
* ecodesign;   
* fornecedores sustentáveis;   
* ACV;   
* inovação aplicada. 

São diferenciais importantes e demonstram gestão estruturada.

**Peso 1,00 — Diferencial**  
Práticas que fortalecem a melhoria contínua:

* indicadores;   
* redução do consumo de matérias-primas;   
* cooperação tecnológica. 

Contribuem significativamente para a evolução da maturidade.

**Peso 0,75 — Complementar**  
Práticas voltadas à comunicação e disseminação das ações.  
Embora importantes, não são determinantes para caracterizar a maturidade bioeconômica da organização.

**MATRIZ DE PESOS – PILAR SOCIAL (S)**

| ID | Pergunta | Tema | O que avalia | Categoria | Peso |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **S01** | A empresa cumpre integralmente a legislação trabalhista e previdenciária? | Conformidade Trabalhista | Atendimento às obrigações legais nas relações de trabalho. | **Essencial** | **1,50** |
| **S02** | A empresa possui política formal de saúde e segurança do trabalho? | Saúde e Segurança | Estrutura de prevenção de acidentes e promoção da saúde ocupacional. | **Essencial** | **1,50** |
| **S03** | São monitorados acidentes e indicadores de SST? | Gestão de SST | Monitoramento e melhoria contínua da segurança ocupacional. | Estratégica | **1,25** |
| **S04** | Os colaboradores recebem treinamentos periódicos? | Capacitação | Desenvolvimento contínuo das competências profissionais. | Estratégica | **1,25** |
| **S05** | Existe programa de desenvolvimento de lideranças? | Desenvolvimento Humano | Formação de lideranças e sucessão organizacional. | Diferencial | **1,00** |
| **S06** | A empresa realiza avaliação de desempenho dos colaboradores? | Gestão de Pessoas | Monitoramento do desempenho e desenvolvimento profissional. | Estratégica | **1,25** |
| **S07** | Existem ações voltadas ao bem-estar físico e mental dos colaboradores? | Qualidade de Vida | Promoção da saúde integral e do ambiente de trabalho saudável. | Estratégica | **1,25** |
| **S08** | A empresa promove diversidade, equidade e inclusão? | Diversidade e Inclusão | Valorização da diversidade e igualdade de oportunidades. | Estratégica | **1,25** |
| **S09** | Existem políticas contra discriminação e assédio? | Direitos Humanos | Prevenção de práticas discriminatórias e proteção da dignidade humana. | **Essencial** | **1,50** |
| **S10** | Existe canal para denúncias relacionadas ao ambiente de trabalho? | Ética nas Relações de Trabalho | Mecanismos seguros para comunicação de irregularidades. | Estratégica | **1,25** |
| **S11** | A empresa realiza pesquisas de clima organizacional? | Clima Organizacional | Monitoramento da satisfação e engajamento dos colaboradores. | Diferencial | **1,00** |
| **S12** | A empresa desenvolve ações de relacionamento com a comunidade? | Relacionamento Comunitário | Integração e contribuição para o desenvolvimento local. | Estratégica | **1,25** |
| **S13** | Existem programas de investimento social privado ou voluntariado? | Investimento Social | Apoio estruturado a iniciativas sociais e comunitárias. | Diferencial | **1,00** |
| **S14** | A empresa prioriza fornecedores locais ou da agricultura familiar quando aplicável? | Desenvolvimento Territorial | Fortalecimento da economia local e geração de impacto positivo. | Estratégica | **1,25** |
| **S15** | São avaliados critérios sociais na seleção de fornecedores? | Cadeia de Valor Responsável | Gestão dos riscos sociais na cadeia de suprimentos. | Estratégica | **1,25** |
| **S16** | A empresa monitora satisfação de clientes e consumidores? | Relacionamento com Clientes | Gestão da experiência e confiança dos clientes. | Estratégica | **1,25** |
| **S17** | Existe política de proteção de dados e privacidade dos clientes? | Proteção de Dados | Garantia da segurança das informações pessoais e conformidade legal. | **Essencial** | **1,50** |
| **S18** | A empresa comunica de forma transparente seus produtos e serviços? | Comunicação Responsável | Clareza e veracidade das informações ao mercado. | Diferencial | **1,00** |
| **S19** | São desenvolvidas ações de educação ou conscientização para clientes e comunidade? | Educação e Engajamento | Disseminação de conhecimento e fortalecimento da cultura sustentável. | Complementar | **0,75** |
| **S20** | A empresa acompanha indicadores sociais para tomada de decisão? | Indicadores Sociais | Uso de métricas para gestão estratégica do capital humano e impacto social. | Estratégica | **1,25** |
| **S21** | Existe estratégia formal para geração de valor social no território onde atua? | Impacto Social Estratégico | Integração do desenvolvimento social ao planejamento estratégico da empresa. | **Essencial** | **1,50** |

**Justificativa técnica dos pesos do Pilar Social**

**Peso 1,50 – Essencial**  
Critérios cuja ausência representa riscos legais, reputacionais e humanos significativos.  
Incluem:

* conformidade trabalhista;   
* saúde e segurança ocupacional;   
* direitos humanos;   
* proteção de dados;   
* estratégia de impacto social. 

Esses elementos são fundamentais para qualquer organização comprometida com práticas ESG.

**Peso 1,25 – Estratégica**  
Práticas que fortalecem a gestão social e demonstram maturidade organizacional:

* treinamentos;   
* diversidade;   
* relacionamento comunitário;   
* gestão da cadeia de fornecedores;   
* indicadores sociais;   
* satisfação dos clientes. 

Representam mecanismos estruturados de gestão e melhoria contínua.

**Peso 1,00 – Diferencial**  
Critérios que ampliam o impacto positivo da organização:

* desenvolvimento de lideranças;   
* clima organizacional;   
* investimento social;   
* comunicação responsável. 

São importantes para consolidar uma cultura organizacional sustentável.

**Peso 0,75 – Complementar**  
Práticas de apoio que reforçam a cultura ESG, mas não determinam isoladamente a maturidade da organização.  
Neste caso:

* ações de educação e conscientização para clientes e comunidade.

**MATRIZ DE PESOS – PILAR GOVERNANÇA (G)**

| ID | Pergunta | Tema | O que avalia | Categoria | Peso |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **G01** | A empresa possui missão, visão e valores formalizados? | Direcionamento Estratégico | Clareza da identidade organizacional e direcionamento institucional. | Estratégica | **1,25** |
| **G02** | A alta direção participa das decisões relacionadas ao ESG? | Liderança ESG | Comprometimento da liderança com a sustentabilidade. | **Essencial** | **1,50** |
| **G03** | Existe política formal de ESG ou sustentabilidade? | Política ESG | Institucionalização das práticas ESG. | **Essencial** | **1,50** |
| **G04** | Existe planejamento estratégico contendo metas ESG? | Planejamento Estratégico | Integração da sustentabilidade ao planejamento empresarial. | **Essencial** | **1,50** |
| **G05** | A empresa acompanha indicadores ESG periodicamente? | Indicadores ESG | Monitoramento sistemático do desempenho ESG. | Estratégica | **1,25** |
| **G06** | Existe responsável ou comitê para gestão ESG? | Estrutura de Governança | Definição de responsabilidades e tomada de decisão. | Estratégica | **1,25** |
| **G07** | Existe Código de Ética ou Conduta? | Ética Corporativa | Formalização dos princípios éticos da organização. | **Essencial** | **1,50** |
| **G08** | O Código de Ética é divulgado e aplicado aos colaboradores? | Cultura Ética | Disseminação e efetividade da cultura ética. | Estratégica | **1,25** |
| **G09** | Existe canal de denúncias independente? | Compliance | Mecanismos de prevenção e tratamento de irregularidades. | **Essencial** | **1,50** |
| **G10** | Existe procedimento para investigação e tratamento das denúncias? | Integridade | Capacidade de resposta às ocorrências éticas. | Estratégica | **1,25** |
| **G11** | A empresa realiza avaliação periódica de riscos? | Gestão de Riscos | Identificação, avaliação e mitigação de riscos corporativos. | **Essencial** | **1,50** |
| **G12** | Os riscos ESG são incorporados ao processo decisório? | Gestão Integrada de Riscos | Integração dos riscos ESG à estratégia organizacional. | **Essencial** | **1,50** |
| **G13** | Existe política anticorrupção? | Integridade Corporativa | Prevenção de fraude, corrupção e conflitos de interesse. | **Essencial** | **1,50** |
| **G14** | Os colaboradores recebem treinamento sobre ética e compliance? | Capacitação em Compliance | Desenvolvimento da cultura de integridade. | Estratégica | **1,25** |
| **G15** | A empresa atende aos requisitos da LGPD? | Proteção de Dados | Conformidade com a legislação de proteção de dados pessoais. | **Essencial** | **1,50** |
| **G16** | Existe processo para gestão documental e registros? | Gestão da Informação | Organização e rastreabilidade das informações corporativas. | Estratégica | **1,25** |
| **G17** | A empresa identifica e dialoga com suas partes interessadas? | Stakeholders | Gestão do relacionamento com públicos estratégicos. | Estratégica | **1,25** |
| **G18** | Existe transparência na divulgação de informações relevantes? | Transparência | Prestação de contas e comunicação com stakeholders. | Estratégica | **1,25** |
| **G19** | A empresa divulga resultados ESG ou relatório de sustentabilidade? | Reporte ESG | Comunicação estruturada do desempenho ESG. | Diferencial | **1,00** |
| **G20** | Existe processo de melhoria contínua do sistema de gestão? | Melhoria Contínua | Aprimoramento permanente dos processos de gestão. | Estratégica | **1,25** |
| **G21** | A empresa realiza auditorias internas ou avaliações periódicas dos processos? | Auditoria e Controles | Verificação da eficácia dos controles internos. | Estratégica | **1,25** |
| **G22** | As decisões estratégicas consideram riscos climáticos, sociais e regulatórios? | Governança Estratégica | Integração da sustentabilidade na tomada de decisão. | **Essencial** | **1,50** |
| **G23** | Existe estratégia formal para fortalecimento contínuo da governança corporativa? | Maturidade em Governança | Evolução da governança como elemento estratégico do negócio. | **Essencial** | **1,50** |

**Justificativa técnica dos pesos do Pilar Governança**

**Peso 1,50 – Essencial**  
Foram classificados como essenciais os critérios que estruturam a governança e reduzem riscos críticos para a organização, incluindo:

* comprometimento da alta direção;   
* política ESG;   
* planejamento estratégico;   
* código de ética;   
* canal de denúncias;   
* gestão de riscos;   
* política anticorrupção;   
* conformidade com a LGPD;   
* integração dos riscos ESG na tomada de decisão. 

Sem esses elementos, dificilmente uma organização demonstra uma governança madura e alinhada às boas práticas.

**Peso 1,25 – Estratégica**  
São práticas que consolidam e operacionalizam a governança:

* indicadores ESG;   
* comitê ou responsável por ESG;   
* comunicação da cultura ética;   
* investigação de denúncias;   
* treinamentos;   
* gestão documental;   
* relacionamento com stakeholders;   
* transparência;   
* melhoria contínua;   
* auditorias internas. 

Esses critérios evidenciam uma gestão estruturada e orientada ao desempenho.

**Peso 1,00 – Diferencial**  
Foi atribuído ao reporte ESG, pois sua elaboração demonstra transparência e maturidade, mas ainda não é obrigatória para a maioria das organizações de pequeno e médio porte.  
