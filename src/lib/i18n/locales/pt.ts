import type { Dict } from "../dict";

export const pt: Dict = {
  meta: {
    title: "Roto — remova o fundo das imagens sem enviá-las",
    description:
      "Um removedor de fundo que roda dentro do navegador. As imagens nunca são enviadas a um servidor, não há fila e o resultado é baixado na resolução original.",
    studioTitle: "Estúdio",
    studioDescription:
      "Solte uma imagem, recorte o sujeito e troque o fundo por qualquer cor ou gradiente.",
    notFoundTitle: "Essa página não existe",
    notFoundBody:
      "O link pode ter um erro de digitação, ou a página nunca esteve lá.",
    backHome: "Voltar para o início",
  },
  common: {
    openStudio: "Abrir o estúdio",
    sourceCode: "Código-fonte",
    readCode: "Ler o código",
    close: "Fechar",
    skipToContent: "Pular para o conteúdo",
  },
  theme: {
    label: "Aparência",
    light: "Claro",
    dark: "Escuro",
    system: "Seguir o sistema",
  },
  lang: { label: "Idioma" },
  hero: {
    badge: "Roda no seu aparelho",
    titleA: "Levante o sujeito.",
    titleB: "Descarte o resto.",
    lead: "O Roto recorta o fundo das imagens dentro do próprio navegador. O arquivo nunca sai do seu aparelho, então não há fila, não há cota diária e não há nada que você precise aceitar na fé sobre o que acontece com a sua foto.",
    cta: "Recortar a primeira imagem",
    note: "Sem conta · sem envio · sem marca d'água",
    caption: "Alpha matte · 8 bits",
  },
  pillars: [
    {
      title: "Processado no seu aparelho",
      body: "O modelo de segmentação roda no seu próprio navegador via WebAssembly. A imagem não encosta nos nossos servidores, porque não existe servidor do outro lado para recebê-la.",
    },
    {
      title: "Resolução original",
      body: "O que você baixa é o resultado nas dimensões do arquivo original. A prévia pode ser reduzida por velocidade, mas a exportação é sempre remontada a partir dos dados completos.",
    },
    {
      title: "Funciona sem conexão",
      body: "Depois que o primeiro download do modelo fica guardado no navegador, as imagens seguintes continuam sendo processadas mesmo sem rede.",
    },
  ],
  steps: {
    eyebrow: "Como funciona",
    heading: "Quatro passos, nada escondido",
    items: [
      {
        title: "Traga uma imagem",
        body: "Arraste o arquivo até a área de envio, cole da área de transferência ou escolha na galeria do celular. JPG, PNG e WebP até 12 MB.",
      },
      {
        title: "Espere o recorte",
        body: "O modelo separa o sujeito do fundo. Uma foto comum termina em segundos, e a barra de progresso mostra a etapa que está realmente rodando, não um número inventado.",
      },
      {
        title: "Defina o novo fundo",
        body: "Deixe transparente, escolha uma cor da paleta, digite seu próprio HEX ou rgb(), ou use um gradiente. A prévia muda na hora.",
      },
      {
        title: "Baixe",
        body: "PNG para fundo transparente, JPG quando precisar de um arquivo leve, WebP quando estiver atrás do menor tamanho.",
      },
    ],
  },
  features: {
    eyebrow: "O que tem dentro",
    items: [
      {
        title: "HEX e rgb() do mesmo jeito",
        body: "O campo de cor aceita #FF0000, #F00, rgb(255, 0, 0) e também rgba() quando você quer um fundo semitransparente. Erro de digitação é sinalizado, não ignorado em silêncio.",
      },
      {
        title: "Um comparador que se arrasta",
        body: "Um divisor só para julgar o recorte. Funciona com mouse, com o dedo e com as setas do teclado.",
      },
      {
        title: "Três formatos de exportação",
        body: "O PNG mantém o canal alfa. JPG e WebP existem para quando tudo o que você precisa é de um arquivo pequeno para subir em outro lugar.",
      },
    ],
  },
  limits: {
    eyebrow: "Os limites",
    heading: "O que vale saber antes de testar",
    items: [
      {
        title: "Um primeiro download de 54 MB",
        body: "O modelo de segmentação precisa chegar ao navegador primeiro. Uma vez só, e depois fica guardado. Em plano limitado, faça isso no Wi-Fi.",
      },
      {
        title: "Aparelhos antigos ficam mais lentos",
        body: "O cálculo fica no seu celular ou notebook, não em um servidor. Um celular de entrada pode levar mais de dez segundos por imagem.",
      },
      {
        title: "Cabelo fino ainda é difícil",
        body: "O modo preciso fica bem mais limpo nas bordas suaves, mas nenhum modelo é perfeito quando o fundo tem cor parecida com a do sujeito.",
      },
    ],
  },
  closer: {
    heading: "Abra uma imagem e veja você mesmo",
    body: "Sem cadastro na frente. Abra o estúdio, solte um arquivo, pronto.",
  },
  footer: {
    tagline: "Feito para ser usado sem entregar suas fotos a ninguém.",
  },
  studio: {
    onDevice: "Processado neste aparelho",
    back: "Voltar para o início",
    dropTitle: "Solte uma imagem aqui",
    dropBody:
      "Arraste o arquivo até esta área, cole da área de transferência ou use o botão abaixo.",
    pick: "Escolher imagem",
    formats: "JPG · PNG · WEBP — 12 MB no máximo",
    qualityLabel: "Qualidade",
    lightTitle: "Leve",
    lightNote:
      "Modelo de {mb} MB · o mais leve, para aparelhos e conexões limitados",
    balancedTitle: "Equilibrado",
    balancedNote:
      "Modelo de {mb} MB · a opção do meio, suficiente para quase todas as fotos",
    maximumTitle: "Máximo",
    maximumNote:
      "Modelo de {mb} MB · mais limpo em cabelos e bordas suaves",
    auditOpen: "Verificar o catálogo de modelos",
    auditResult:
      "Foram lidos {models} modelos na origem. O menor {small} bytes, o maior {big} bytes — nada fora desse intervalo.",
    auditSize: "{mb} MB",
    auditTiny: "{kb} KB",
    auditMath:
      "O número de cada nível acima soma o motor de {rt} MB ao seu modelo, porque é isso que realmente é baixado.",
    auditNote:
      "Lido do servidor de origem no momento em que você apertou o botão, não é um número escrito neste aplicativo. Recarregue para conferir de novo.",
    auditFailed:
      "O catálogo não pôde ser lido — a rede falhou ou a origem recusou. Os tamanhos nos níveis acima estão sem verificação agora.",
    downloadPng: "Baixar PNG",
    transparentSuffix: "transparente",
    exportNote:
      "Sempre exportado na resolução original, não no tamanho da prévia.",
    another: "Outra imagem",
    restored: "Seu último resultado foi restaurado depois que a aba fechou.",
    modelNote: "Troque de modelo quando quiser; o recorte é refeito na mesma imagem.",
    attireLabel: "Vestuário",
    attireNone: "Sem paletó",
    attire: [
      "Terno grafite",
      "Terno azul-marinho",
      "Blazer sem gravata",
    ],
    attireAuto:
      "Posicionado automaticamente a partir dos ombros e do pescoço no recorte.",
    attireManual:
      "Os ombros não puderam ser lidos nesta foto. Ajuste o tamanho e a altura você mesmo.",
    attireSize: "Tamanho",
    attireDrop: "Altura",
    firstDownloadNote:
      "Este download de {mb} MB acontece uma vez só. Depois de guardado no navegador, as imagens seguintes são processadas sem rede nenhuma.",
    errUnsupported: "Esse formato ainda não é aceito. Use JPG, PNG ou WebP.",
    errTooBig: "Um arquivo de {mb} MB passa do limite de 12 MB. Reduza antes.",
    errFailed: "Não deu para processar a imagem. Tente de novo com outro arquivo.",
    errExport: "Não deu para preparar o arquivo de download.",
    errDecode: "O resultado não pode ser lido como imagem.",
  },
  progress: {
    downloading: "Baixando o modelo para o seu aparelho",
    engine: "Ligando o motor no navegador",
    separating: "Separando o sujeito do fundo",
    done: "Pronto",
    working: "em andamento…",
    preparing: "Preparando…",
  },
  compare: {
    before: "Original",
    after: "Roto",
    sliderLabel: "Arraste para comparar antes e depois",
    altBefore: "A imagem original antes do processamento",
    altAfter: "O resultado depois que o fundo foi removido",
  },
  bg: {
    bgLabel: "Fundo",
    gradientLabel: "Gradiente",
    customLabel: "Cor própria",
    transparent: "Transparente",
    wheel: "Escolher na roda de cores",
    spectrum: "Espectro de cores",
    hue: "Matiz",
    alpha: "Opacidade",
    count: "16.777.216 cores",
    hint: "Aceita HEX e rgb(), incluindo rgba() se quiser um fundo semitransparente.",
    invalid: "Não deu para interpretar. Tente #FF0000, #F00 ou rgb(255, 0, 0).",
    presets: [
      "Branco",
      "Preto",
      "Cinza de estúdio",
      "Luz de laboratório",
      "Azul de documento",
      "Vermelho de documento",
      "Verde de croma",
      "Creme",
    ],
    gradients: ["Entardecer", "Névoa", "Meia-noite", "Mar"],
    wallpaperLabel: "Papel de parede",
    wallpapers: [
      "Cinza de estúdio",
      "Azul de passaporte",
      "Grafite",
      "Areia quente",
      "Céu",
      "Sálvia",
    ],
    upload: "Sua própria imagem",
    uploadHint: "O arquivo fica neste aparelho",
    fitCover: "Preencher",
    fitContain: "Ajustar",
  },
};
