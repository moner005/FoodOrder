import { useState } from "react";
import "./FAQs.css";

const faqs = [
  {
    question: "How can I place an order?",
    answer:
      "Browse our menu, choose your favorite meals, add them to your cart, and continue to checkout to enter your delivery details.",
  },
  {
    question: "How can I track my order?",
    answer:
      "You can check your order status from the My Orders section once order tracking is connected.",
  },
  {
    question: "Can I cancel my order?",
    answer:
      "Order cancellation depends on the order status and restaurant policy. Please contact our support team for assistance.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "Available payment methods will be displayed when payment integration is enabled.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Delivery time depends on your location, restaurant preparation time, and delivery availability.",
  },
  {
    question: "What if I receive the wrong order?",
    answer:
      "Please contact our customer support team and provide your order details so we can help resolve the issue.",
  },
  {
    question: "Can I customize my meal?",
    answer:
      "Meal customization depends on the options provided by each restaurant.",
  },
  {
    question: "How can I contact customer support?",
    answer:
      "You can contact us through hello@swiftbite.com or visit our Contact Us page.",
  },
];

export default function FAQsPage() {
  const [activeIndex, setActiveIndex] =
    useState<number | null>(null);

  return (
    <main className="faqs-page">
      <header className="faqs-heading">
        <span>WE ARE HERE TO HELP</span>
        <h1>Frequently Asked Questions</h1>
        <p>
          Everything you need to know about ordering
          delicious food with SwiftBite.
        </p>
      </header>

      <section className="faqs-container">
        {faqs.map((faq, index) => (
          <article
            className={`faq-item ${
              activeIndex === index ? "active" : ""
            }`}
            key={faq.question}
          >
            <button
              type="button"
              className="faq-question"
              aria-expanded={activeIndex === index}
              onClick={() =>
                setActiveIndex(
                  activeIndex === index ? null : index
                )
              }
            >
              <span>{faq.question}</span>
              <span className="faq-icon">
                {activeIndex === index ? "−" : "+"}
              </span>
            </button>

            {activeIndex === index && (
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            )}
          </article>
        ))}
      </section>

      <section className="faqs-contact">
        <h2>Still have questions?</h2>
        <p>
          Our team is happy to help you with your
          food ordering experience.
        </p>
        <a href="mailto:hello@swiftbite.com">
          Contact Support →
        </a>
      </section>
    </main>
  );
}