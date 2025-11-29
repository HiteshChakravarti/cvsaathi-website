import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

function getFaqs(t: any) {
  return [
    {
      question: t('landing.faq.questions.q1'),
      answer: t('landing.faq.answers.a1'),
    },
    {
      question: t('landing.faq.questions.q2'),
      answer: t('landing.faq.answers.a2'),
    },
    {
      question: t('landing.faq.questions.q3'),
      answer: t('landing.faq.answers.a3'),
    },
    {
      question: t('landing.faq.questions.q4'),
      answer: t('landing.faq.answers.a4'),
    },
    {
      question: t('landing.faq.questions.q5'),
      answer: t('landing.faq.answers.a5'),
    },
    {
      question: t('landing.faq.questions.q6'),
      answer: t('landing.faq.answers.a6'),
    },
    {
      question: t('landing.faq.questions.q7'),
      answer: t('landing.faq.answers.a7'),
    },
    {
      question: t('landing.faq.questions.q8'),
      answer: t('landing.faq.answers.a8'),
    },
  ];
}

export function FAQ() {
  const { t } = useTranslation();
  const faqs = getFaqs(t);

  return (
    <section className="py-32 px-6 relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
      {/* Decorative elements */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-cyan-100/40 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 mb-6 bg-teal-50 border border-teal-200 rounded-full shadow-sm"
          >
          <span className="text-teal-700 uppercase tracking-wider">
            {t('landing.faq.badge')}
          </span>
          </motion.div>
          <h2
            className="mb-6"
            style={{
              fontSize: '3rem',
              fontWeight: 600,
              lineHeight: 1.2,
              background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
        >
          {t('landing.faq.title')}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t('landing.faq.description')}
        </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-white border-2 border-gray-200 rounded-2xl px-6 hover:border-teal-300 transition-all data-[state=open]:border-teal-500 data-[state=open]:shadow-lg data-[state=open]:shadow-teal-500/10"
                >
                  <AccordionTrigger className="text-gray-900 hover:text-teal-600 hover:no-underline py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pb-6 whitespace-pre-line">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-white rounded-3xl p-8 border-2 border-teal-200 shadow-xl">
            <h3 className="text-gray-900 mb-3">
              {t('landing.faq.stillHaveQuestions')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('landing.faq.supportDescription')}
            </p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 transition-all"
            >
              {t('landing.faq.contactSupport')}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}