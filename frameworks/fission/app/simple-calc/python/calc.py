def main():
    num_1 = int(request.form['num_1'])
    num_2 = int(request.form['num_2'])
    operator = request.form['operator']

    if operator == '+':
        result = num_1 + num_2
    elsif operator == '-':
        result = num_1 - num_2
        
    return "%s %s %s = %s" % (num_1, operator, num_2, result)

