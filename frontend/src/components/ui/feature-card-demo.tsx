import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, BarChart3, FileWarning } from "lucide-react";

import { FeatureCard } from "@/components/ui/feature-card";

const features = [
  {
    icon: <FileWarning className="h-12 w-12" />,
    title: "Sem método claro",
    description:
      "Iniciativas ESG isoladas geram retrabalho e pouca evidência para auditorias.",
  },
  {
    icon: <AlertTriangle className="h-12 w-12" />,
    title: "Perda de oportunidades",
    description:
      "Editais, contratos e crédito exigem critérios ESG e muitas empresas chegam despreparadas.",
  },
  {
    icon: <BarChart3 className="h-12 w-12" />,
    title: "Baixa rastreabilidade",
    description:
      "Sem dados consolidados, fica difícil comprovar impacto para clientes, investidores e parceiros.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

const FeatureCardDemo = () => {
  return (
    <div className="w-full bg-background p-8 text-foreground md:p-12">
      <motion.div
        className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {features.map((feature, index) => (
          <motion.div key={index} variants={itemVariants}>
            <FeatureCard
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default FeatureCardDemo;
