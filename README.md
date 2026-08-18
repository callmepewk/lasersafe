# LASER-SAFE

## Modelo Físico-Matemático, Algorítmico e Sistema de Suporte à Decisão Clínica

**Autor e desenvolvedor:** Pedro Henrique Brezolin de Freitas

**Formação e qualificações acadêmicas complementares:**
- Computer Science for Business Professionals — Harvard University
- Generative AI — UNESCO
- Artificial Intelligence: Implications for Business Strategy — MIT Sloan School of Management

**Data da documentação:** 18 de agosto de 2026

---

## 1. Visão geral

O Laser-Safe é um sistema computacional de suporte à decisão clínica desenvolvido a partir de um modelo algorítmico, físico e matemático destinado à parametrização de procedimentos que utilizam tecnologias laser e outras tecnologias relacionadas.

O sistema foi concebido para transformar parâmetros clínicos, físicos e tecnológicos em uma interface simples e intuitiva, mantendo uma camada de engenharia computacional e modelagem físico-matemática responsável pelo processamento das informações.

Sua arquitetura foi concebida para permitir a parametrização de diferentes tecnologias, fabricantes, modelos, aplicadores, ponteiras, geometrias e configurações de aplicação.

O sistema é concebido como um **Clinical Decision Support System (CDSS)**: fornece suporte computacional à decisão e à parametrização, sem substituir a avaliação, julgamento ou decisão final do profissional habilitado.

---

# 2. Objetivo

O objetivo do Laser-Safe é fornecer uma estrutura computacional capaz de:

- estruturar parâmetros clínicos relevantes;
- estruturar parâmetros físicos relacionados à aplicação;
- normalizar diferentes tecnologias e equipamentos;
- relacionar fabricantes, modelos e tecnologias;
- considerar diferentes configurações de ponteiras e aplicadores;
- considerar características geométricas e de varredura;
- processar parâmetros de energia, fluência, pulso, frequência e demais grandezas aplicáveis;
- incorporar características clínicas do paciente;
- fornecer suporte à parametrização;
- apresentar os resultados de maneira simples e intuitiva;
- permitir rastreabilidade entre os parâmetros selecionados e a resposta computacional produzida.

---

# 3. Concepção do modelo

O Laser-Safe foi desenvolvido sob uma arquitetura de múltiplas camadas:

```text
Características clínicas
        ↓
Parametrização clínica
        ↓
Tecnologia / equipamento
        ↓
Fabricante / modelo
        ↓
Ponteira / aplicador / geometria
        ↓
Parâmetros físicos
        ↓
Motor algorítmico
        ↓
Resultado computacional
        ↓
Clinical Decision Support System

A simplicidade da interface é consequência da existência de uma camada de processamento responsável por organizar, validar e relacionar os parâmetros envolvidos.

# 4. Parametrização clínica

O modelo contempla parâmetros clínicos utilizados como entradas para a caracterização do caso.

Entre os parâmetros estruturados encontram-se:

fototipo de Fitzpatrick;
classificação de Glogau;
idade;
gênero;
sensibilidade da pele;
tipo de alvo;
características relacionadas à condição avaliada;
classificação de cicatrizes de acne;
escala de Leeds;
exposição solar;
hábitos de bronzeamento.

# 4.1 Fitzpatrick

A classificação de Fitzpatrick é utilizada como parâmetro de entrada na caracterização do perfil da pele.

Sua seleção integra a etapa de parametrização do caso antes da geração da resposta computacional.

# 4.2 Glogau

A classificação de Glogau também integra a parametrização clínica e é utilizada como característica de entrada do caso.

A transformação matemática específica de Fitzpatrick e Glogau dentro do motor algorítmico deve ser documentada juntamente com as equações correspondentes do modelo proprietário.

# 5. Parametrização tecnológica

O Laser-Safe foi concebido para trabalhar com diferentes plataformas tecnológicas.

A parametrização permite selecionar características relacionadas a:

tipo de laser;
tecnologia;
comprimento de onda;
fabricante;
modelo;
ponteira;
aplicador;
geometria;
forma do feixe;
modo de aplicação;
área de varredura;
densidade de pontos;
padrão de aplicação;
profundidade;
sistema de resfriamento.

# 6. Tecnologias contempladas

A base de dados do sistema contempla diferentes tecnologias e plataformas, incluindo, entre outras:

CO₂;
Nd:YAG;
Alexandrite;
Diodo;
PDL;
IPL;
Er:YAG;
Er:Glass;
Pico;
KTP;
tecnologias híbridas;
tecnologias fracionadas;
outras plataformas laser e relacionadas.

A arquitetura foi concebida para permitir expansão da base sem alterar o conceito fundamental do motor de parametrização.

# 7. Base de fabricantes e equipamentos

O Laser-Safe possui uma camada estruturada de dados destinada à representação de fabricantes, modelos e tecnologias.

A base utilizada no projeto foi alimentada com mais de 500 fabricantes nacionais e internacionais, seus respectivos modelos e tecnologias disponíveis na base.

Essa arquitetura permite que a tecnologia seja tratada de maneira independente do equipamento específico.

Assim:

Tecnologia
    ↓
Fabricante
    ↓
Modelo
    ↓
Características técnicas
    ↓
Aplicador / ponteira
    ↓
Geometria
    ↓
Parâmetros de aplicação

O objetivo dessa abordagem é evitar que o algoritmo seja dependente de um único fabricante ou equipamento.

# 8. Parâmetros físicos

A estrutura de dados do Laser-Safe contempla parâmetros físicos e operacionais como:

fluência;
unidade de fluência;
energia;
energia em mJ;
potência;
duração de pulso;
largura de pulso;
frequência;
spot size;
intensidade;
nível de agressividade;
fator de segurança;
modulador de intensidade;
forma do feixe;
área de varredura;
densidade de pontos;
padrão de aplicação;
profundidade;
resfriamento.

A relação matemática entre essas variáveis constitui o núcleo do modelo físico-matemático.

# 9. Modelo algorítmico

O motor do Laser-Safe recebe um conjunto de entradas clínicas, tecnológicas e físicas e produz uma resposta computacional parametrizada.

De forma conceitual:

Paciente
   +
Características clínicas
   +
Equipamento
   +
Características físicas
   +
Parâmetros de aplicação
        ↓
Modelo físico-matemático
        ↓
Motor algorítmico
        ↓
Parametrização calculada
        ↓
Interface CDSS

As equações específicas, coeficientes, pesos, funções de transformação e relações entre variáveis constituem parte da especificação técnica proprietária do modelo e devem ser documentadas em sua versão matemática completa.

# 10. Margem de precisão e tolerância

A avaliação da precisão e tolerância do sistema foi conduzida por meio de julgamento clínico associado a disparos de teste e observação das respostas produzidas.

O processo considerou:

seleção das características clínicas;
seleção da tecnologia;
seleção do equipamento;
parametrização física;
geração da resposta computacional;
realização de testes;
observação da resposta;
julgamento clínico;
comparação entre resposta observada e comportamento esperado;
refinamento da parametrização quando aplicável.

A margem de tolerância não é tratada exclusivamente como uma constante matemática isolada, mas como resultado da interação entre os parâmetros físicos, tecnológicos e clínicos considerados pelo modelo.

# 11. Validação

# 11.1 Validação institucional inicial

A validação inicial do Laser-Safe foi conduzida em contexto institucional, envolvendo a Faculdade CTA, em São Paulo, e a plataforma Pele Digital.

O processo envolveu a utilização prática do sistema e a avaliação dos parâmetros produzidos pelo modelo.

A validação considerou a participação de profissionais relacionados à avaliação e aplicação de tecnologias laser e procedimentos estéticos.

# 11.2 Método de avaliação

O processo de avaliação incluiu:

parametrização dos casos;
seleção das tecnologias;
seleção dos equipamentos;
geração dos parâmetros;
disparos de teste;
observação da resposta;
julgamento clínico;
avaliação da coerência da parametrização;
refinamento do modelo.

# 12. Resultados observados

Durante o processo de validação descrito, foram observados resultados considerados de alta precisão e acurácia nas condições avaliadas.

Foi adotado um limite operacional de aproximadamente 98% para o sistema, dentro do escopo pretendido para suporte à decisão clínica e das condições de conformidade consideradas na implementação.

O valor de 98% deve ser interpretado como um limite operacional adotado no sistema e não como uma afirmação de acurácia clínica universal ou uma métrica estatística populacional.

# 13. Clinical Decision Support System

O Laser-Safe foi concebido como um Clinical Decision Support System (CDSS).

Sua finalidade é fornecer suporte computacional ao profissional, e não substituir sua avaliação ou decisão.

A arquitetura conceitual é:

Dados clínicos
       +
Dados tecnológicos
       +
Dados físicos
       ↓
    LASER-SAFE
       ↓
Suporte computacional
       ↓
Profissional habilitado
       ↓
Decisão clínica final

O sistema não deve ser interpretado como autorização automática para execução de procedimentos.

# 14. Segurança e disclaimers

A interface deve comunicar claramente que:

o sistema é uma ferramenta de suporte à decisão;
a recomendação computacional não substitui avaliação profissional;
os parâmetros devem ser avaliados antes da aplicação;
o profissional permanece responsável pela decisão clínica;
a correta seleção das características do paciente e do equipamento é essencial;
os resultados dependem das condições de entrada;
o sistema não constitui diagnóstico médico autônomo;
o sistema não deve ser utilizado como substituto da avaliação clínica.

Os disclaimers fazem parte da própria arquitetura de utilização do CDSS.

# 15. Arquitetura de Deep Engineering

A interface do Laser-Safe foi deliberadamente desenvolvida para permanecer simples e intuitiva, apesar da complexidade existente na camada de engenharia.

A arquitetura pode ser representada como:

                    INTERFACE
                        │
                        ▼
                 CAMADA DE CDS
                        │
                        ▼
              MOTOR ALGORÍTMICO
                        │
             ┌──────────┴──────────┐
             │                     │
      MODELO MATEMÁTICO      MODELO FÍSICO
             │                     │
             └──────────┬──────────┘
                        │
                        ▼
               BASE DE EQUIPAMENTOS
                        │
             ┌──────────┼──────────┐
             │          │          │
        Fabricantes   Modelos   Tecnologias

A abstração da interface permite que o usuário trabalhe com parâmetros compreensíveis enquanto o processamento interno realiza a combinação das variáveis estruturadas.

#16. Universalização do modelo

Um dos princípios arquiteturais do Laser-Safe é a capacidade de operar sobre diferentes fabricantes, modelos e tecnologias.

O objetivo é construir uma estrutura universal de parametrização em vez de criar um cálculo isolado para um equipamento específico.

A universalização depende da capacidade de:

normalizar tecnologias;
estruturar fabricantes;
estruturar modelos;
representar diferentes configurações;
representar diferentes unidades;
representar diferentes ponteiras;
representar diferentes geometrias;
representar diferentes formas de aplicação;
aplicar tolerâncias e fatores de segurança;
incorporar parâmetros clínicos.

# 17. Estrutura de dados

O modelo de dados LaserCalculation contempla informações como:

fototipo;
idade;
gênero;
sensibilidade;
tipo de alvo;
tecnologia;
ponteira;
unidade de fluência;
nível de agressividade;
fluência;
duração de pulso;
frequência;
spot size;
intensidade de resfriamento;
fator de segurança;
modulador de intensidade;
forma do feixe;
área de varredura;
densidade de pontos;
padrão;
profundidade;
energia;
largura de pulso;
modo de varredura;
Glogau;
classificação de cicatrizes;
escala de Leeds;
exposição solar;
bronzeamento.

# 18. Formulação matemática

A formulação matemática completa do modelo deverá apresentar, para cada variável:

Campo	Descrição
Símbolo	Representação matemática
Nome	Nome da variável
Unidade	Unidade física
Tipo	Entrada, intermediária ou saída
Domínio	Valores permitidos
Origem	Paciente, equipamento ou cálculo
Dependências	Variáveis relacionadas
Transformação	Operação algorítmica
Equação	Relação matemática
Tolerância	Margem aplicável
Saída	Resultado produzido

As equações proprietárias serão documentadas em versão específica da especificação matemática.

# 19. Autoria

O Laser-Safe foi concebido e desenvolvido por:

Pedro Henrique Brezolin de Freitas

Com contribuição direta na:

concepção da arquitetura;
modelagem algorítmica;
lógica de decisão;
modelagem físico-matemática;
estruturação da parametrização;
arquitetura de dados;
modelagem do fluxo clínico e operacional;
desenvolvimento técnico;
implementação do sistema;
construção da interface CDSS.

As competências técnicas relacionadas à computação, inteligência artificial, física e matemática foram desenvolvidas e aplicadas em projetos institucionais e formação complementar, incluindo:

Computer Science for Business Professionals — Harvard University

Generative AI — UNESCO

Artificial Intelligence: Implications for Business Strategy — MIT Sloan School of Management

# 20. Rastreabilidade

A implementação computacional do modelo está associada ao projeto Laser-Safe mantido no GitHub:

https://github.com/callmepewk/lasersafe

A documentação técnico-científica deve ser considerada em conjunto com a versão correspondente do código e da base de dados utilizada na implementação.

# 21. Natureza da obra

O Laser-Safe compreende conjuntamente:

modelo físico-matemático;
modelo algorítmico;
estrutura de parametrização;
base de dados de tecnologias, fabricantes e modelos;
arquitetura computacional;
lógica de decisão;
interface de Clinical Decision Support System;
metodologia de validação;
documentação técnica.

O sistema constitui, portanto, uma implementação computacional de um modelo algorítmico e físico-matemático aplicado à parametrização e suporte à decisão em tecnologias laser.

# 22. Declaração técnica

Este documento registra a concepção, arquitetura, implementação e metodologia associadas ao Laser-Safe na data indicada.

As informações clínicas, matemáticas e físicas devem ser interpretadas dentro das condições, parâmetros e limitações definidos pela implementação correspondente.

O Laser-Safe fornece suporte computacional e não substitui avaliação ou decisão profissional.
