import 'package:flutter_test/flutter_test.dart';
import 'package:smartcoihamobile/app.dart';

void main() {
  testWidgets('App renders smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const SmartCoIHAApp());
    await tester.pump();

    expect(find.text('SmartCoIHA'), findsAny);
  });
}
