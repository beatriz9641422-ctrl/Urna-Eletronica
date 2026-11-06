spublic class UrnaEscolar {

    static class Chapa {
        String nome;
        int numero;
    }

    public static void main(String[] args) {
        Chapa chapa1 = new Chapa();
        chapa1.nome = "Inovação";
        chapa1.numero = 10;

        Chapa chapa2 = new Chapa();
        chapa2.nome = "Futuro";
        chapa2.numero = 20;

        Chapa chapa3 = new Chapa();
        chapa3.nome = "Transformação";
        chapa3.numero = 30;

        System.out.println("Chapa 1: " + chapa1.numero + " - " + chapa1.nome);
        System.out.println("Chapa 2: " + chapa2.numero + " - " + chapa2.nome);
        System.out.println("Chapa 3: " + chapa3.numero + " - " + chapa3.nome);
    }
}
