type ErrorMessageProps = {
  title: string;
  content: string | object;
};

type ResultMessageProps = {
  result: {
    data?: {
      success?: boolean;
      error?: string;
      [key: string]: unknown;
    };
    fetchError?: string;
    serverError?: { error: string } | string;
    validationErrors?: object;
    bindArgsValidationErrors?: object;
  };
};

const ErrorMessage: React.FC<ErrorMessageProps> = ({ title, content }) => (
  <div className='mt-4 text-sm text-gray-600 dark:text-gray-300'>
    <strong>{title}:</strong>{' '}
    {typeof content === 'string' ? (
      content
    ) : (
      <pre>{JSON.stringify(content, null, 2)}</pre>
    )}
  </div>
);

export const ResultMessage: React.FC<ResultMessageProps> = ({ result }) => {
  if (
    result.data ||
    result.fetchError ||
    result.serverError ||
    result.validationErrors ||
    result.bindArgsValidationErrors
  ) {
    if (process.env.NODE_ENV !== 'development') {
      return null;
    }
    return (
      <div className='max-w-md mx-auto mt-8 p-6 rounded-lg shadow-md bg-background'>
        <div
          className={`text-center text-lg font-semibold ${
            result.data?.success
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {result.data?.success ? (
            'Success!'
          ) : (
            <pre className='text-left'>{result.data?.error} </pre>
          )}
        </div>
        {result.fetchError && (
          <ErrorMessage title='Fetch Error' content={result.fetchError} />
        )}
        {result.bindArgsValidationErrors && (
          <ErrorMessage
            title='Bind Args Validation Errors'
            content={result.bindArgsValidationErrors}
          />
        )}
        {result.validationErrors && (
          <ErrorMessage
            title='Validation Errors'
            content={result.validationErrors}
          />
        )}
        {result.serverError && (
          <ErrorMessage
            title='Server Error'
            content={
              typeof result.serverError === 'string'
                ? result.serverError
                : result.serverError.error
            }
          />
        )}
      </div>
    );
  }
  return null;
};
