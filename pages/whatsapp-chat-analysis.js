import Head from 'next/head';
import Navbar from '../components/designndev/Navbar';
import Footer from '../components/designndev/Footer';
import ButtonLink from '../components/ui/ButtonLink';

export default function WhatsAppChatAnalysisPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>WhatsApp Chat Analysis | Design n Dev</title>
        <meta
          name="description"
          content="Understand your WhatsApp chats with privacy-first, client-side analysis. Upload an exported chat and explore insights like message volume, busiest days, top participants, and more."
        />
      </Head>

      <Navbar />

      <main className="flex-1">
        <section className="pt-28 pb-14 bg-gradient-to-b from-emerald-50 via-white to-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-7">
                <p className="inline-flex items-center gap-2 text-sm font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Privacy-first analytics
                </p>
                <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
                  WhatsApp Chat Analysis
                </h1>
                <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl">
                  Turn an exported WhatsApp chat into clean insights. See trends, activity patterns, and participation breakdowns
                  without sending your chat data to our servers.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <ButtonLink href="/signup" variant="gradient">
                    Create an account
                  </ButtonLink>
                  <ButtonLink href="/login?redirect=/dashboard#whatsapp-analysis" variant="outline">
                    Open in dashboard
                  </ButtonLink>
                </div>

                <div className="mt-6 text-sm text-slate-500">
                  Tip: already signed in? Go directly to{' '}
                  <a href="/dashboard#whatsapp-analysis" className="font-semibold text-emerald-700 hover:text-emerald-800 no-underline">
                    /dashboard#whatsapp-analysis
                  </a>
                  .
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-6">
                  <h2 className="text-lg font-bold text-slate-900">What you’ll get</h2>
                  <ul className="mt-4 space-y-3 text-slate-600">
                    <li className="flex gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      <span>
                        <strong className="text-slate-800">Activity overview</strong>: messages by day/week/month and peak hours.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      <span>
                        <strong className="text-slate-800">Participants</strong>: who talks most and how the conversation is balanced.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      <span>
                        <strong className="text-slate-800">Trends</strong>: growth/decline patterns and conversation bursts.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      <span>
                        <strong className="text-slate-800">Privacy</strong>: designed to run client-side; your file is not uploaded to our servers.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <h3 className="text-sm font-bold text-slate-900">Supported uploads</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Exported WhatsApp chat <code className="px-1 py-0.5 rounded bg-white border">.txt</code> or a zipped export{' '}
                    <code className="px-1 py-0.5 rounded bg-white border">.zip</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How it works</h2>
                <ol className="mt-6 space-y-4 text-slate-700">
                  <li>
                    <strong>1) Export your chat</strong> from WhatsApp (without media is usually fastest).
                  </li>
                  <li>
                    <strong>2) Upload the exported file</strong> in the dashboard WhatsApp Analysis section.
                  </li>
                  <li>
                    <strong>3) Review insights</strong> like activity patterns, totals, and participation breakdowns.
                  </li>
                </ol>

                <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
                  <h3 className="text-base font-bold text-slate-900">Important note about privacy</h3>
                  <p className="mt-2 text-sm text-slate-700">
                    The WhatsApp Chat Analysis tool is intended to run on your device (client-side). Don’t upload chats you’re not
                    allowed to analyze, and avoid sharing sensitive exports.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-5">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Call to action</h2>
                <p className="mt-4 text-slate-600">
                  Want to try it right now? Create an account, then open the dashboard section dedicated to WhatsApp Analysis.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <ButtonLink href="/signup" variant="primary">
                    Sign up
                  </ButtonLink>
                  <ButtonLink href="/login?redirect=/dashboard#whatsapp-analysis" variant="emerald">
                    Go to WhatsApp Analysis in dashboard
                  </ButtonLink>
                  <a
                    href="/dashboard#whatsapp-analysis"
                    className="inline-flex items-center justify-center whitespace-nowrap px-6 py-3 rounded-xl font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all no-underline cursor-pointer"
                  >
                    Already signed in? Open dashboard section
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-14 border-t border-slate-200 pt-10">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">FAQ</h2>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-slate-200 p-6 bg-white">
                  <h3 className="font-semibold text-slate-900">Do you upload my chat to the server?</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    The dashboard tool is built to run client-side for privacy. Your exported file should be processed in your browser.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-6 bg-white">
                  <h3 className="font-semibold text-slate-900">Which file formats work?</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Upload an exported WhatsApp chat <code className="px-1 py-0.5 rounded bg-slate-50 border">.txt</code> or a{' '}
                    <code className="px-1 py-0.5 rounded bg-slate-50 border">.zip</code> created by WhatsApp export.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-6 bg-white">
                  <h3 className="font-semibold text-slate-900">Where do I find it in the dashboard?</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Use this direct link: <code className="px-1 py-0.5 rounded bg-slate-50 border">/dashboard#whatsapp-analysis</code>.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-6 bg-white">
                  <h3 className="font-semibold text-slate-900">Is this official WhatsApp / Meta?</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    No—this is an independent analytics feature. “WhatsApp” is a trademark of its respective owner.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

