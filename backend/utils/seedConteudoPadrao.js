import { Exercicio } from "../models/exercicioM.js";
import { Genero } from "../models/generoM.js";
import { GrupoMuscular } from "../models/grupoMuscularM.js";

const generosPadrao = [
    { nome: "masculino" },
    { nome: "feminino" }
];

const gruposMuscularesPadrao = [
    { nome: "Peito" },
    { nome: "Perna" },
    { nome: "Bíceps" },
    { nome: "Tríceps" },
    { nome: "Costas" },
    { nome: "Ombros" }
];

const exerciciosPadrao = [
    {
        nome: "Supino Reto",
        descricao: "Deite-se no banco reto com os pés apoiados no chão. Segure a barra com as mãos um pouco mais afastadas que a largura dos ombros. Abaixe a barra em direção ao peito e suba com força.",
        grupoMuscular: "Peito",
        imagem: "https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/supino-inclinado-com-halteres.gif"
    },
    {
        nome: "Rosca Direta",
        descricao: "De pé, com os pés apoiados no chão. Mantenha os cotovelos junto ao corpo e flexione os antebração para cima levantando a barra até a altura dos ombros.",
        grupoMuscular: "Bíceps",
        imagem: "https://www.hipertrofia.org/blog/wp-content/uploads/2024/02/barbell-standing-close-grip-curl.gif"
    },
    {
        nome: "Agachamento Livre",
        descricao: "De pé com os pés afastados na largura dos ombros. Coloque a barra sobre os ombros e abaixe dobrando os joelhos até formar um ângulo de 90 graus. Retorne à posição inicial.",
        grupoMuscular: "Perna",
        imagem: "https://static.wixstatic.com/media/2edbed_3221a5a1ebd247fe89d72b84e28c4520~mv2.webp"
    },
    {
        nome: "Rosca Francês",
        descricao: "De pé ou sentado, com a barra/haltere acima da cabeça. Flexione os cotovelos para baixar o peso atrás da cabeça, mantendo os cotovelos estáticos, depois estenda.",
        grupoMuscular: "Tríceps",
        imagem: "https://www.hipertrofia.org/blog/wp-content/uploads/2025/01/triceps-frances-com-um-halter-sentado.gif"
    },
    {
        nome: "Puxada Frontal",
        descricao: "Sentado na máquina, segure a barra com os braços estendidos. Puxe a barra em direção ao peito, mantendo os cotovelos para baixo, depois retorne controlado.",
        grupoMuscular: "Costas",
        imagem: "https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/costas-puxada-aberta-com-barra-no-pulley.gif"
    },
    {
        nome: "Desenvolvimento de Ombros",
        descricao: "Sentado, com as mãos segurando halteres ao nível dos ombros. Empurre os halteres para cima até a extensão completa dos cotovelos, depois abaixe em controle.",
        grupoMuscular: "Ombros",
        imagem: "https://i0.wp.com/omelhortreino.com.br/wp-content/uploads/2025/03/Desenvolvimento-de-Ombro-no-Banco-com-Halteres-1.gif?resize=500%2C500&ssl=1"
    },
    {
        nome: "Leg Press",
        descricao: "Sentado na máquina com os pés na plataforma na largura dos ombros. Flexione os joelhos para 90 graus e estenda as pernas completamente, sem trancar os joelhos.",
        grupoMuscular: "Perna",
        imagem: "https://media.tenor.com/xJh_-w_SxckAAAAM/leg-press.gif"
    },
    {
        nome: "Barra Fixa",
        descricao: "Pendurado na barra com as mãos afastadas um pouco mais que a largura dos ombros. Puxe o corpo para cima dobrando os cotovelos, tentando levar o queixo acima da barra.",
        grupoMuscular: "Costas",
        imagem: "https://www.hipertrofia.org/blog/wp-content/uploads/2023/08/barra-fixa-negativa.gif"
    },
    {
        nome: "Extensão de Perna",
        descricao: "Sentado na máquina com as pernas sob o acolchoamento. Estenda as pernas para cima até a extensão completa, sem trancar os joelhos no final do movimento.",
        grupoMuscular: "Perna",
        imagem: "https://media.tenor.com/bqKtsSuqilQAAAAM/gym.gif"
    },
    {
        nome: "Crucifixo Inclinado",
        descricao: "Deitado em banco inclinado, segure halteres com os braços ligeiramente flexionados. Abra os braços em movimento de arco, unindo os halteres acima do peito, depois retorne.",
        grupoMuscular: "Peito",
        imagem: "https://www.hipertrofia.org/blog/wp-content/uploads/2020/06/dumbbell-incline-fly.gif"
    },
    {
        nome: "Supino Inclinado",
        descricao: "Deite-se em um banco inclinado, segure a barra ou halteres e empurre o peso para cima até estender os braços. Desça de forma controlada até a altura do peito.",
        grupoMuscular: "Peito",
        imagem: "https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/supino-inclinado-com-barra.gif"
    },
    {
        nome: "Crucifixo Reto",
        descricao: "Deite-se em um banco reto com halteres nas mãos. Abra os braços em arco até sentir o alongamento do peito e volte unindo os halteres acima do tronco.",
        grupoMuscular: "Peito",
        imagem: "https://www.hipertrofia.org/blog/wp-content/uploads/2024/10/crucifixo-chao-com-halteres.gif"
    },
    {
        nome: "Crossover no Cabo",
        descricao: "Fique entre as polias, segure as alças e leve as mãos à frente do corpo em movimento de abraço, ativando o peitoral de forma controlada.",
        grupoMuscular: "Peito",
        imagem: "https://static.wixstatic.com/media/5d211d_c5cc4a754e8e499eafc275c719f4b1d2~mv2.gif"
    },
    {
        nome: "Rosca Martelo",
        descricao: "Em pé, segure os halteres com pegada neutra e flexione os cotovelos levando os pesos até próximo dos ombros, sem balançar o corpo.",
        grupoMuscular: "Bíceps",
        imagem: "https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/rosca-biceps-martelo-com-halteres.gif"
    },
    {
        nome: "Rosca Scott",
        descricao: "Apoie os braços no banco Scott e flexione os cotovelos para elevar a barra ou halter, mantendo o movimento isolado no bíceps.",
        grupoMuscular: "Bíceps",
        imagem: "https://www.mundoboaforma.com.br/wp-content/uploads/2020/11/Rosca-Scott-com-halteres-com-dois-bracos.gif"
    },
    {
        nome: "Tríceps Testa",
        descricao: "Deite-se em um banco e, com a barra ou halteres, flexione os cotovelos levando o peso em direção à testa. Estenda os braços para voltar.",
        grupoMuscular: "Tríceps",
        imagem: "https://www.mundoboaforma.com.br/wp-content/uploads/2021/07/triceps-testa-no-banco-inclinado.gif"
    },
    {
        nome: "Tríceps Paralela",
        descricao: "Apoie o corpo nas barras paralelas, flexione os cotovelos até descer o tronco e empurre para cima até a extensão dos braços.",
        grupoMuscular: "Tríceps",
        imagem: "https://www.hipertrofia.org/blog/wp-content/uploads/2025/01/paralelas-para-triceps-com-carga.gif"
    },
    {
        nome: "Remada Curvada",
        descricao: "Com o tronco inclinado, segure a barra e puxe em direção ao abdômen, mantendo a coluna estável e contraindo as costas.",
        grupoMuscular: "Costas",
        imagem: "https://image.tuasaude.com/media/article/bu/bs/remada-curvada_75582.gif?width=686&height=487"
    },
    {
        nome: "Remada Baixa",
        descricao: "Sentado na máquina, puxe o cabo em direção ao abdômen com os cotovelos próximos ao corpo e retorne de forma controlada.",
        grupoMuscular: "Costas",
        imagem: "https://www.hipertrofia.org/blog/wp-content/uploads/2024/08/remada-supinada.gif"
    },
    {
        nome: "Levantamento Terra",
        descricao: "Com a barra próxima às pernas, flexione quadris e joelhos para pegar o peso e levante estendendo o corpo com postura firme.",
        grupoMuscular: "Costas",
        imagem: "https://www.hipertrofia.org/blog/wp-content/uploads/2023/03/barbell-sumo-deadlift.gif"
    },
    {
        nome: "Elevação Lateral",
        descricao: "Em pé, segure halteres ao lado do corpo e eleve os braços lateralmente até a linha dos ombros, sem usar impulso.",
        grupoMuscular: "Ombros",
        imagem: "https://image.tuasaude.com/media/article/nj/tp/elevacao-lateral_75627.gif?width=686&height=487"
    },
    {
        nome: "Face Pull",
        descricao: "Na polia alta, puxe a corda em direção ao rosto com os cotovelos abertos, ativando ombros e parte superior das costas.",
        grupoMuscular: "Ombros",
        imagem: "https://www.meridian-fitness.co.uk/wp-content/uploads/2025/02/Cable-Face-Pull.gif"
    },
    {
        nome: "Afundo",
        descricao: "Dê um passo à frente e desça o corpo até os dois joelhos formarem ângulos próximos de 90 graus. Retorne e repita com a outra perna.",
        grupoMuscular: "Perna",
        imagem: "https://image.tuasaude.com/media/article/vs/mb/afundo_75588.gif?width=686&height=487"
    },
    {
        nome: "Cadeira Extensora",
        descricao: "Sentado na máquina, estenda as pernas até quase travar os joelhos e retorne lentamente à posição inicial.",
        grupoMuscular: "Perna",
        imagem: "https://media.tenor.com/bqKtsSuqilQAAAAM/gym.gif"
    },
    {
        nome: "Mesa Flexora",
        descricao: "Deitado ou sentado na máquina, flexione os joelhos para puxar o peso, focando a contração dos posteriores de coxa.",
        grupoMuscular: "Perna",
        imagem: "https://media.tenor.com/fj_cZPprAyMAAAAM/gym.gif"
    },
    {
        nome: "Panturrilha em Pé",
        descricao: "Fique em pé na máquina ou com peso e eleve os calcanhares ao máximo, contraindo as panturrilhas antes de descer lentamente.",
        grupoMuscular: "Perna",
        imagem: "https://www.hipertrofia.org/blog/wp-content/uploads/2023/03/lever-standing-calf-raise.gif"
    },
    {
        nome: "Panturrilha Sentado",
        descricao: "Sentado na máquina, pressione a plataforma com a ponta dos pés e eleve os calcanhares o máximo possível.",
        grupoMuscular: "Perna",
        imagem: "https://www.hipertrofia.org/blog/wp-content/uploads/2018/10/lever-seated-calf-raise-.gif"
    },
    {
        nome: "Pulldown na Polia",
        descricao: "Sentado na estação de puxada, leve a barra em direção ao peito com controle, mantendo o tronco estável.",
        grupoMuscular: "Costas",
        imagem: "https://grandeatleta.com.br/blog/wp-content/uploads/2025/01/pull-down.gif"
    },
    {
        nome: "Desenvolvimento Militar",
        descricao: "Em pé ou sentado, empurre a barra ou halteres acima da cabeça até a extensão total dos braços, retornando de forma controlada.",
        grupoMuscular: "Ombros",
        imagem: "https://www.hipertrofia.org/blog/wp-content/uploads/2018/12/desenvolvimento-militar.gif"
    },
    {
        nome: "Abdução de Ombros",
        descricao: "Use a máquina ou elásticos para afastar os braços lateralmente, fortalecendo principalmente a lateral do ombro.",
        grupoMuscular: "Ombros",
        imagem: "https://i.pinimg.com/originals/e4/29/bb/e429bb7c9759c7415bdb7f7474752dd9.gif"
    }
];

export async function seedConteudoPadrao() {
    await Promise.all(
        generosPadrao.map((genero) =>
            Genero.findOrCreate({
                where: { nome: genero.nome },
                defaults: genero
            })
        )
    );

    const gruposCriados = await Promise.all(
        gruposMuscularesPadrao.map((grupo) =>
            GrupoMuscular.findOrCreate({
                where: { nome: grupo.nome },
                defaults: grupo
            })
        )
    );

    const grupoPorNome = Object.fromEntries(
        gruposCriados.map(([grupo]) => [grupo.nome, grupo])
    );

    await Promise.all(
        exerciciosPadrao.map((exercicio) =>
            Exercicio.findOrCreate({
                where: { nome: exercicio.nome },
                defaults: {
                    nome: exercicio.nome,
                    descricao: exercicio.descricao,
                    grupo_muscular_id: grupoPorNome[exercicio.grupoMuscular]?.id || null,
                    imagem: exercicio.imagem
                }
            })
        )
    );
}
